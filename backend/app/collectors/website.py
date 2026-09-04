from __future__ import annotations

from urllib.parse import urljoin, urlparse

import httpx
import trafilatura
from bs4 import BeautifulSoup

from app.collectors.models import CollectedItem, normalize_url


USER_AGENT = (
    "Mozilla/5.0 (compatible; AriCollector/1.0; +https://ari-b0f40.web.app)"
)


def _extract_links(html: str, base_url: str, limit: int) -> list[str]:
    soup = BeautifulSoup(html, "html.parser")
    links: list[str] = []
    seen: set[str] = set()
    base_host = urlparse(base_url).netloc

    for anchor in soup.find_all("a", href=True):
        href = anchor["href"].strip()
        if not href or href.startswith(("#", "mailto:", "javascript:")):
            continue
        absolute = normalize_url(urljoin(base_url, href))
        parsed = urlparse(absolute)
        if parsed.scheme not in ("http", "https"):
            continue
        if base_host and parsed.netloc and parsed.netloc != base_host:
            continue
        # Heurística: caminhos com vários segmentos costumam ser matérias
        path = parsed.path.strip("/")
        if path.count("/") < 1 and len(path) < 12:
            continue
        if absolute in seen:
            continue
        seen.add(absolute)
        links.append(absolute)
        if len(links) >= limit:
            break

    return links


def _article_from_url(url: str) -> CollectedItem | None:
    downloaded = trafilatura.fetch_url(url)
    if not downloaded:
        return None

    extracted = trafilatura.extract(
        downloaded,
        include_comments=False,
        include_tables=False,
        favor_recall=True,
        output_format="txt",
    )
    meta = trafilatura.extract_metadata(downloaded)

    title = (meta.title if meta and meta.title else "").strip()
    if not title:
        soup = BeautifulSoup(downloaded, "html.parser")
        if soup.title and soup.title.string:
            title = soup.title.string.strip()
    if not title:
        return None

    text = (extracted or "").strip()
    summary = text[:400] if text else title[:300]
    image_url = meta.image if meta else None

    return CollectedItem(
        title=title[:500],
        summary=summary[:1000],
        original_url=normalize_url(url),
        image_url=image_url,
        published_at=None,
        external_id=None,
        raw_excerpt=text[:2000] if text else title,
    )


def collect_from_website(site_url: str, limit: int = 10) -> list[CollectedItem]:
    headers = {"User-Agent": USER_AGENT}
    with httpx.Client(timeout=25.0, follow_redirects=True, headers=headers) as client:
        response = client.get(site_url)
        response.raise_for_status()
        html = response.text

    article_urls = _extract_links(html, site_url, limit=limit * 2)
    if not article_urls:
        # Tenta extrair a própria home como único item
        item = _article_from_url(site_url)
        return [item] if item else []

    items: list[CollectedItem] = []
    for url in article_urls:
        if len(items) >= limit:
            break
        try:
            item = _article_from_url(url)
            if item:
                items.append(item)
        except Exception:
            continue

    if not items:
        raise ValueError("Não foi possível extrair matérias do site.")

    return items
