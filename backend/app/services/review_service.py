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
    ref, data = _get_article(article_id)
    if data.get("status") not in ("review", "rejected"):
        raise ValueError(
            f"Artigo não está em revisão (status={data.get('status')})."
        )

    db = get_db()
    ref.update(
        {
            "status": "approved",
            "reviewedAt": SERVER_TIMESTAMP,
            "reviewedBy": admin.uid,
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
    db.collection("activityLogs").add(
        {
            "type": "review",
            "action": "approved",
            "userId": admin.uid,
            "articleId": article_id,
            "detail": f"Aprovado: {data.get('adaptedTitle', '')[:120]}",
            "createdAt": SERVER_TIMESTAMP,
        }
    )
    return {
        "articleId": article_id,
        "status": "approved",
        "reviewId": review_ref.id,
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
