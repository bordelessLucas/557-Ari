from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any

from google.cloud import firestore

from app.auth import AdminUser
from app.collectors.models import CollectedItem
from app.collectors.rss import collect_from_rss
from app.collectors.website import collect_from_website
from app.config import get_settings
from app.firebase_admin_app import get_db
from app.services.dedupe import already_collected, content_hash

SERVER_TIMESTAMP = firestore.SERVER_TIMESTAMP


@dataclass
class SourceCollectResult:
    source_id: str
    source_name: str
    found: int = 0
    created: int = 0
    duplicated: int = 0
    error: str | None = None


@dataclass
class CollectRunResult:
    run_id: str
    sources: list[SourceCollectResult] = field(default_factory=list)

    @property
    def total_found(self) -> int:
        return sum(item.found for item in self.sources)

    @property
    def total_created(self) -> int:
        return sum(item.created for item in self.sources)

    @property
    def total_duplicated(self) -> int:
        return sum(item.duplicated for item in self.sources)

    def to_dict(self) -> dict[str, Any]:
        return {
            "runId": self.run_id,
            "totalFound": self.total_found,
            "totalCreated": self.total_created,
            "totalDuplicated": self.total_duplicated,
            "sources": [asdict(item) for item in self.sources],
        }


def _fetch_active_sources(source_id: str | None = None) -> list[dict[str, Any]]:
    db = get_db()
    if source_id:
        snap = db.collection("sources").document(source_id).get()
        if not snap.exists:
            raise ValueError(f"Fonte {source_id} não encontrada.")
        data = snap.to_dict() or {}
        data["id"] = snap.id
        if data.get("status") != "active":
            raise ValueError(f"Fonte {source_id} não está ativa.")
        return [data]

    docs = (
        db.collection("sources")
        .where("status", "==", "active")
        .stream()
    )
    sources: list[dict[str, Any]] = []
    for doc in docs:
        data = doc.to_dict() or {}
        data["id"] = doc.id
        sources.append(data)
    return sources


def _collect_items_for_source(source: dict[str, Any], limit: int) -> list[CollectedItem]:
    kind = source.get("kind") or "website"
    rss_url = (source.get("rssUrl") or "").strip()
    site_url = (source.get("siteUrl") or "").strip()
    api_url = (source.get("apiUrl") or "").strip()

    if kind == "rss" or rss_url:
        if not rss_url:
            raise ValueError("Fonte RSS sem url de feed.")
        return collect_from_rss(rss_url, limit=limit)

    if kind == "api":
        raise ValueError(
            "Coleta via API ainda não implementada para esta fonte "
            f"({api_url or 'sem endpoint'})."
        )

    if not site_url:
        raise ValueError("Fonte website sem siteUrl.")
    return collect_from_website(site_url, limit=min(limit, 12))


def _persist_item(
    item: CollectedItem,
    source: dict[str, Any],
    triggered_by: str,
) -> bool:
    """Returns True if created, False if duplicate."""
    source_id = source["id"]
    if already_collected(
        original_url=item.original_url,
        external_id=item.external_id,
        source_id=source_id,
        title=item.title,
    ):
        return False

    db = get_db()
    digest = content_hash(item.original_url, item.title)
    # Doc ID determinístico reduz corrida de duplicatas no mesmo URL.
    doc_id = digest[:40]
    ref = db.collection("collectedNews").document(doc_id)
    if ref.get().exists:
        return False

    payload = {
        "title": item.title,
        "summary": item.summary,
        "originalUrl": item.original_url,
        "imageUrl": item.image_url,
        "publishedAt": item.published_at,
        "collectedAt": SERVER_TIMESTAMP,
        "sourceId": source_id,
        "sourceName": source.get("name") or "",
        "categoryIds": source.get("categoryIds") or [],
        "externalId": item.external_id,
        "contentHash": digest,
        "status": "collected",
        "rawExcerpt": item.raw_excerpt,
        "triggeredBy": triggered_by,
    }
    ref.set(payload)
    return True


def _update_source_stats(source_id: str, created: int) -> None:
    db = get_db()
    ref = db.collection("sources").document(source_id)
    updates: dict[str, Any] = {
        "lastCheckedAt": SERVER_TIMESTAMP,
        "updatedAt": SERVER_TIMESTAMP,
    }
    if created:
        updates["newsCount"] = firestore.Increment(created)
    ref.update(updates)


def _write_run_logs(
    run_id: str,
    *,
    triggered_by: str,
    triggered_by_email: str | None,
    results: list[SourceCollectResult],
    status: str = "succeeded",
) -> None:
    db = get_db()
    now = datetime.now(timezone.utc)
    errors = [r.error for r in results if r.error]
    run_status = "failed" if errors and not any(r.created for r in results) else status
    if errors and any(r.created for r in results):
        run_status = "partial"

    db.collection("collectionRuns").document(run_id).set(
        {
            "runId": run_id,
            "status": run_status,
            "triggeredBy": triggered_by,
            "triggeredByEmail": triggered_by_email,
            "createdAt": SERVER_TIMESTAMP,
            "finishedAt": now,
            "totalFound": sum(r.found for r in results),
            "totalCreated": sum(r.created for r in results),
            "totalDuplicated": sum(r.duplicated for r in results),
            "sourceCount": len(results),
            "errors": errors,
        },
        merge=True,
    )

    for result in results:
        db.collection("activityLogs").add(
            {
                "type": "collect",
                "action": "source_collect",
                "userId": triggered_by,
                "sourceId": result.source_id,
                "sourceName": result.source_name,
                "detail": (
                    result.error
                    if result.error
                    else (
                        f"Encontrados {result.found}, novos {result.created}, "
                        f"duplicados {result.duplicated}"
                    )
                ),
                "found": result.found,
                "created": result.created,
                "duplicated": result.duplicated,
                "error": result.error,
                "runId": run_id,
                "createdAt": SERVER_TIMESTAMP,
            }
        )


def run_collection(
    admin: AdminUser | None = None,
    source_id: str | None = None,
    *,
    triggered_by: str | None = None,
    triggered_by_email: str | None = None,
) -> CollectRunResult:
    settings = get_settings()
    limit = settings.collect_max_items_per_source
    sources = _fetch_active_sources(source_id)
    run_id = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%f")
    actor_id = triggered_by or (admin.uid if admin else "system")
    actor_email = triggered_by_email or (admin.email if admin else None)

    db = get_db()
    db.collection("collectionRuns").document(run_id).set(
        {
            "runId": run_id,
            "status": "running",
            "triggeredBy": actor_id,
            "triggeredByEmail": actor_email,
            "createdAt": SERVER_TIMESTAMP,
            "sourceCount": len(sources),
        }
    )

    results: list[SourceCollectResult] = []

    for source in sources:
        result = SourceCollectResult(
            source_id=source["id"],
            source_name=source.get("name") or source["id"],
        )
        try:
            items = _collect_items_for_source(source, limit=limit)
            result.found = len(items)
            for item in items:
                try:
                    created = _persist_item(item, source, triggered_by=actor_id)
                    if created:
                        result.created += 1
                    else:
                        result.duplicated += 1
                except Exception as item_exc:
                    if result.error is None:
                        result.error = f"Falha parcial: {item_exc}"
            _update_source_stats(source["id"], result.created)
        except Exception as exc:
            result.error = str(exc)
            try:
                _update_source_stats(source["id"], 0)
            except Exception:
                pass

        results.append(result)

    _write_run_logs(
        run_id,
        triggered_by=actor_id,
        triggered_by_email=actor_email,
        results=results,
    )
    return CollectRunResult(run_id=run_id, sources=results)
