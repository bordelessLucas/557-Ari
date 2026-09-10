from __future__ import annotations

from typing import Any

from google.cloud import firestore

from app.auth import AdminUser
from app.firebase_admin_app import get_db

SERVER_TIMESTAMP = firestore.SERVER_TIMESTAMP


def _get_article(article_id: str) -> tuple[Any, dict[str, Any]]:
    db = get_db()
    ref = db.collection("articles").document(article_id)
    snap = ref.get()
    if not snap.exists:
        raise ValueError(f"Artigo {article_id} não encontrado.")
    data = snap.to_dict() or {}
    return ref, data


def approve_article(article_id: str, admin: AdminUser) -> dict[str, Any]:
    """Aprova e publica no portal (feed do leitor) em um único passo."""
    ref, data = _get_article(article_id)
    if data.get("status") not in ("review", "rejected"):
        raise ValueError(
            f"Artigo não está em revisão (status={data.get('status')})."
        )

    db = get_db()
    ref.update(
        {
            "status": "published",
            "reviewedAt": SERVER_TIMESTAMP,
            "reviewedBy": admin.uid,
            "publishedAt": SERVER_TIMESTAMP,
            "publishedBy": admin.uid,
            "rejectionReason": None,
            "updatedAt": SERVER_TIMESTAMP,
        }
    )
    review_ref = db.collection("reviews").document()
    review_ref.set(
        {
            "articleId": article_id,
            "decision": "approved",
            "userId": admin.uid,
            "reason": None,
            "createdAt": SERVER_TIMESTAMP,
        }
    )

    publication_ref = db.collection("publications").document()
    publication_ref.set(
        {
            "articleId": article_id,
            "title": data.get("adaptedTitle") or "",
            "summary": data.get("adaptedSummary") or "",
            "body": data.get("adaptedBody") or "",
            "imageUrl": data.get("imageUrl"),
            "categoryIds": data.get("categoryIds") or [],
            "sourceId": data.get("sourceId"),
            "sourceName": data.get("sourceName"),
            "originalUrl": data.get("originalUrl"),
            "publishedBy": admin.uid,
            "publishedAt": SERVER_TIMESTAMP,
            "createdAt": SERVER_TIMESTAMP,
            "status": "published",
        }
    )

    collected_id = data.get("collectedNewsId")
    if collected_id:
        try:
            db.collection("collectedNews").document(collected_id).update(
                {
                    "status": "published",
                    "updatedAt": SERVER_TIMESTAMP,
                }
            )
        except Exception:
            pass

    db.collection("activityLogs").add(
        {
            "type": "review",
            "action": "approved_and_published",
            "userId": admin.uid,
            "articleId": article_id,
            "publicationId": publication_ref.id,
            "detail": f"Aprovado e publicado: {data.get('adaptedTitle', '')[:120]}",
            "createdAt": SERVER_TIMESTAMP,
        }
    )
    return {
        "articleId": article_id,
        "status": "published",
        "reviewId": review_ref.id,
        "publicationId": publication_ref.id,
    }


def reject_article(
    article_id: str,
    admin: AdminUser,
    reason: str | None = None,
) -> dict[str, Any]:
    ref, data = _get_article(article_id)
    if data.get("status") not in ("review", "approved"):
        raise ValueError(
            f"Artigo não pode ser rejeitado (status={data.get('status')})."
        )

    cleaned_reason = (reason or "").strip() or None
    db = get_db()
    ref.update(
        {
            "status": "rejected",
            "reviewedAt": SERVER_TIMESTAMP,
            "reviewedBy": admin.uid,
            "rejectionReason": cleaned_reason,
            "updatedAt": SERVER_TIMESTAMP,
        }
    )
    review_ref = db.collection("reviews").document()
    review_ref.set(
        {
            "articleId": article_id,
            "decision": "rejected",
            "userId": admin.uid,
            "reason": cleaned_reason,
            "createdAt": SERVER_TIMESTAMP,
        }
    )
    db.collection("activityLogs").add(
        {
            "type": "review",
            "action": "rejected",
            "userId": admin.uid,
            "articleId": article_id,
            "detail": cleaned_reason
            or f"Rejeitado: {data.get('adaptedTitle', '')[:120]}",
            "createdAt": SERVER_TIMESTAMP,
        }
    )
    return {
        "articleId": article_id,
        "status": "rejected",
        "reviewId": review_ref.id,
        "reason": cleaned_reason,
    }


def publish_article(article_id: str, admin: AdminUser) -> dict[str, Any]:
    """Move approved article to published and create publications doc."""
    ref, data = _get_article(article_id)
    current = data.get("status")
    if current == "published":
        raise ValueError("Artigo já está publicado.")
    if current != "approved":
        raise ValueError(
            f"Só é possível publicar artigos aprovados (status={current})."
        )

    db = get_db()
    ref.update(
        {
            "status": "published",
            "publishedAt": SERVER_TIMESTAMP,
            "publishedBy": admin.uid,
            "updatedAt": SERVER_TIMESTAMP,
        }
    )

    publication_ref = db.collection("publications").document()
    publication_ref.set(
        {
            "articleId": article_id,
            "title": data.get("adaptedTitle") or "",
            "summary": data.get("adaptedSummary") or "",
            "body": data.get("adaptedBody") or "",
            "imageUrl": data.get("imageUrl"),
            "categoryIds": data.get("categoryIds") or [],
            "sourceId": data.get("sourceId"),
            "sourceName": data.get("sourceName"),
            "originalUrl": data.get("originalUrl"),
            "publishedBy": admin.uid,
            "publishedAt": SERVER_TIMESTAMP,
            "createdAt": SERVER_TIMESTAMP,
            "status": "published",
        }
    )

    collected_id = data.get("collectedNewsId")
    if collected_id:
        try:
            db.collection("collectedNews").document(collected_id).update(
                {
                    "status": "published",
                    "updatedAt": SERVER_TIMESTAMP,
                }
            )
        except Exception:
            pass

    db.collection("activityLogs").add(
        {
            "type": "publication",
            "action": "published",
            "userId": admin.uid,
            "articleId": article_id,
            "publicationId": publication_ref.id,
            "detail": f"Publicado: {data.get('adaptedTitle', '')[:120]}",
            "createdAt": SERVER_TIMESTAMP,
        }
    )

    return {
        "articleId": article_id,
        "status": "published",
        "publicationId": publication_ref.id,
    }


def unpublish_article(article_id: str, admin: AdminUser) -> dict[str, Any]:
    """Revoga publicação: article volta para revisão; publications marcadas unpublished."""
    ref, data = _get_article(article_id)
    if data.get("status") != "published":
        raise ValueError(
            f"Só é possível revogar artigos publicados (status={data.get('status')})."
        )

    db = get_db()
    ref.update(
        {
            "status": "review",
            "publishedAt": None,
            "publishedBy": None,
            "updatedAt": SERVER_TIMESTAMP,
        }
    )

    pubs = (
        db.collection("publications")
        .where("articleId", "==", article_id)
        .stream()
    )
    unpublished = 0
    for snap in pubs:
        snap.reference.update(
            {
                "status": "unpublished",
                "unpublishedAt": SERVER_TIMESTAMP,
                "unpublishedBy": admin.uid,
                "updatedAt": SERVER_TIMESTAMP,
            }
        )
        unpublished += 1

    collected_id = data.get("collectedNewsId")
    if collected_id:
        try:
            db.collection("collectedNews").document(collected_id).update(
                {
                    "status": "collected",
                    "processedByAi": True,
                    "updatedAt": SERVER_TIMESTAMP,
                }
            )
        except Exception:
            pass

    db.collection("activityLogs").add(
        {
            "type": "publication",
            "action": "unpublished",
            "userId": admin.uid,
            "articleId": article_id,
            "detail": f"Publicação revogada: {data.get('adaptedTitle', '')[:120]}",
            "createdAt": SERVER_TIMESTAMP,
        }
    )

    return {
        "articleId": article_id,
        "status": "review",
        "publicationsUnpublished": unpublished,
    }
