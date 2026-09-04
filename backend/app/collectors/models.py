from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from typing import Any


@dataclass
class CollectedItem:
    title: str
    summary: str
    original_url: str
    image_url: str | None = None
    published_at: datetime | None = None
    external_id: str | None = None
    raw_excerpt: str = ""
    extra: dict[str, Any] = field(default_factory=dict)


def parse_feed_date(value: Any) -> datetime | None:
    if value is None:
        return None
    if isinstance(value, datetime):
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value
    if isinstance(value, (int, float)):
        try:
            return datetime.fromtimestamp(value, tz=timezone.utc)
        except (OverflowError, OSError, ValueError):
            return None
    if isinstance(value, str) and value.strip():
        try:
            dt = parsedate_to_datetime(value)
            if dt.tzinfo is None:
                return dt.replace(tzinfo=timezone.utc)
            return dt
        except (TypeError, ValueError, IndexError):
            return None
    return None


def normalize_url(url: str) -> str:
    return (url or "").strip().rstrip("/")
