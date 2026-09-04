from __future__ import annotations

import hashlib
import re

from app.collectors.models import normalize_url
from app.firebase_admin_app import get_db


def content_hash(original_url: str, title: str) -> str:
    normalized_title = re.sub(r"\s+", " ", title.strip().lower())
    base = f"{normalize_url(original_url)}|{normalized_title}"
    return hashlib.sha256(base.encode("utf-8")).hexdigest()


def already_collected(
    *,
    original_url: str,
    external_id: str | None = None,
    source_id: str | None = None,
) -> bool:
    db = get_db()
    url = normalize_url(original_url)

    url_query = (
        db.collection("collectedNews")
        .where("originalUrl", "==", url)
        .limit(1)
        .stream()
    )
    if any(True for _ in url_query):
        return True

    if external_id and source_id:
        ext_query = (
            db.collection("collectedNews")
            .where("sourceId", "==", source_id)
            .where("externalId", "==", external_id)
            .limit(1)
            .stream()
        )
        if any(True for _ in ext_query):
            return True

    return False
