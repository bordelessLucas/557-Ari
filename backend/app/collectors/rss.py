from __future__ import annotations

import feedparser

from app.collectors.models import CollectedItem, normalize_url, parse_feed_date


def collect_from_rss(feed_url: str, limit: int = 30) -> list[CollectedItem]:
    parsed = feedparser.parse(feed_url)
    if getattr(parsed, "bozo", False) and not parsed.entries:
        raise ValueError(
            f"RSS inválido ou inacessível: {getattr(parsed, 'bozo_exception', 'erro desconhecido')}"
        )

    items: list[CollectedItem] = []
    for entry in parsed.entries[:limit]:
        link = normalize_url(
            getattr(entry, "link", None)
            or (entry.get("links") or [{}])[0].get("href", "")
        )
        title = (getattr(entry, "title", None) or "").strip()
        if not link or not title:
            continue

        summary = (
            getattr(entry, "summary", None)
            or getattr(entry, "description", None)
            or ""
        )
        if hasattr(summary, "strip"):
            summary = summary.strip()
        else:
            summary = str(summary)

        image_url = None
        media = getattr(entry, "media_content", None) or getattr(
            entry, "media_thumbnail", None
        )
        if media and isinstance(media, list) and media:
            image_url = media[0].get("url")
        if not image_url:
            enclosures = getattr(entry, "enclosures", None) or []
            for enc in enclosures:
                if str(enc.get("type", "")).startswith("image"):
                    image_url = enc.get("href")
                    break

        published = parse_feed_date(
            getattr(entry, "published", None)
            or getattr(entry, "updated", None)
        )
        if published is None and getattr(entry, "published_parsed", None):
            published = parse_feed_date(
                __import__("time").mktime(entry.published_parsed)
            )

        external_id = getattr(entry, "id", None) or getattr(entry, "guid", None)
        raw = summary[:2000] if summary else title

        items.append(
            CollectedItem(
                title=title[:500],
                summary=(summary[:1000] if summary else title[:300]),
                original_url=link,
                image_url=image_url,
                published_at=published,
                external_id=str(external_id) if external_id else None,
                raw_excerpt=raw,
            )
        )

    return items
