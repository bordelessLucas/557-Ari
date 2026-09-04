from __future__ import annotations

import json
import re
from dataclasses import asdict, dataclass, field
from typing import Any

from google.cloud import firestore
from openai import OpenAI

from app.auth import AdminUser
from app.config import get_settings
from app.firebase_admin_app import get_db
from app.prompts.editorial_v1 import (
    PROMPT_VERSION,
    SYSTEM_PROMPT,
    build_user_prompt,
)

SERVER_TIMESTAMP = firestore.SERVER_TIMESTAMP


@dataclass
class AiItemResult:
    collected_news_id: str
    success: bool
    article_id: str | None = None
    ai_job_id: str | None = None
    error: str | None = None


@dataclass
class AiProcessResult:
    processed: int = 0
    succeeded: int = 0
    failed: int = 0
    items: list[AiItemResult] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "processed": self.processed,
            "succeeded": self.succeeded,
            "failed": self.failed,
            "items": [asdict(item) for item in self.items],
        }


def _require_openai_client() -> OpenAI:
    settings = get_settings()
    if not settings.openai_api_key:
        raise ValueError(
            "OPENAI_API_KEY não configurada no backend. "
            "Defina a chave em backend/.env para processar com IA."
        )
    return OpenAI(api_key=settings.openai_api_key)


def _parse_ai_json(content: str) -> dict[str, Any]:
    text = content.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    data = json.loads(text)
    required = ("adaptedTitle", "adaptedSummary", "adaptedBody")
    for key in required:
        if key not in data or not str(data.get(key, "")).strip():
            raise ValueError(f"Resposta da IA sem campo obrigatório: {key}")
    return {
        "adaptedTitle": str(data["adaptedTitle"]).strip()[:500],
        "adaptedSummary": str(data["adaptedSummary"]).strip()[:2000],
        "adaptedBody": str(data["adaptedBody"]).strip()[:20000],
        "insufficientInfo": bool(data.get("insufficientInfo", False)),
        "warnings": [
            str(w) for w in (data.get("warnings") or []) if str(w).strip()
        ][:20],
    }


def _call_openai(news: dict[str, Any]) -> tuple[dict[str, Any], dict[str, Any]]:
    settings = get_settings()
    client = _require_openai_client()
    user_prompt = build_user_prompt(
        title=news.get("title") or "",
        summary=news.get("summary") or "",
        raw_excerpt=news.get("rawExcerpt") or "",
        source_name=news.get("sourceName") or "",
        original_url=news.get("originalUrl") or "",
    )

    response = client.chat.completions.create(
        model=settings.openai_model,
        temperature=0.3,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
    )
    content = response.choices[0].message.content or ""
    parsed = _parse_ai_json(content)
    usage = {
        "promptTokens": getattr(response.usage, "prompt_tokens", None),
        "completionTokens": getattr(response.usage, "completion_tokens", None),
        "totalTokens": getattr(response.usage, "total_tokens", None),
    }
    return parsed, usage


def _fetch_collected_batch(
    collected_news_id: str | None,
    ids: list[str] | None,
    limit: int,
) -> list[tuple[str, dict[str, Any]]]:
    db = get_db()

    if collected_news_id:
        snap = db.collection("collectedNews").document(collected_news_id).get()
        if not snap.exists:
            raise ValueError(f"Notícia {collected_news_id} não encontrada.")
        data = snap.to_dict() or {}
        if data.get("status") not in ("collected", "error"):
            raise ValueError(
                f"Notícia {collected_news_id} não está elegível "
                f"(status={data.get('status')})."
            )
        return [(snap.id, data)]

    if ids:
        items: list[tuple[str, dict[str, Any]]] = []
        for doc_id in ids[:limit]:
            snap = db.collection("collectedNews").document(doc_id).get()
            if not snap.exists:
                continue
            data = snap.to_dict() or {}
            if data.get("status") in ("collected", "error"):
                items.append((snap.id, data))
        return items

    docs = (
        db.collection("collectedNews")
        .where("status", "==", "collected")
        .limit(limit)
        .stream()
    )
    return [(doc.id, doc.to_dict() or {}) for doc in docs]


def _process_one(
    news_id: str,
    news: dict[str, Any],
    admin: AdminUser,
) -> AiItemResult:
    db = get_db()
    settings = get_settings()
    job_ref = db.collection("aiJobs").document()
    job_id = job_ref.id

    job_ref.set(
        {
            "collectedNewsId": news_id,
            "status": "running",
            "error": None,
            "tokensUsage": None,
            "model": settings.openai_model,
            "promptVersion": PROMPT_VERSION,
            "triggeredBy": admin.uid,
            "createdAt": SERVER_TIMESTAMP,
            "finishedAt": None,
        }
    )
    db.collection("collectedNews").document(news_id).update(
        {"status": "processing"}
    )

    try:
        adapted, usage = _call_openai(news)
        article_ref = db.collection("articles").document()
        article_ref.set(
            {
                "collectedNewsId": news_id,
                "sourceId": news.get("sourceId") or "",
                "sourceName": news.get("sourceName") or "",
                "originalUrl": news.get("originalUrl") or "",
                "originalTitle": news.get("title") or "",
                "originalSummary": news.get("summary") or "",
                "imageUrl": news.get("imageUrl"),
                "categoryIds": news.get("categoryIds") or [],
                "adaptedTitle": adapted["adaptedTitle"],
                "adaptedSummary": adapted["adaptedSummary"],
                "adaptedBody": adapted["adaptedBody"],
                "insufficientInfo": adapted["insufficientInfo"],
                "aiWarnings": adapted["warnings"],
                "status": "review",
                "aiJobId": job_id,
                "model": settings.openai_model,
                "promptVersion": PROMPT_VERSION,
                "createdAt": SERVER_TIMESTAMP,
                "updatedAt": SERVER_TIMESTAMP,
                "reviewedAt": None,
                "reviewedBy": None,
                "rejectionReason": None,
            }
        )
        job_ref.update(
            {
                "status": "succeeded",
                "tokensUsage": usage,
                "articleId": article_ref.id,
                "finishedAt": SERVER_TIMESTAMP,
            }
        )
        db.collection("collectedNews").document(news_id).update(
            {
                "status": "collected",
                "lastAiJobId": job_id,
                "lastArticleId": article_ref.id,
                "aiProcessedAt": SERVER_TIMESTAMP,
                "processedByAi": True,
            }
        )

        db.collection("activityLogs").add(
            {
                "type": "ai",
                "action": "process_succeeded",
                "userId": admin.uid,
                "collectedNewsId": news_id,
                "articleId": article_ref.id,
                "aiJobId": job_id,
                "detail": f"Artigo gerado: {adapted['adaptedTitle'][:120]}",
                "createdAt": SERVER_TIMESTAMP,
            }
        )
        return AiItemResult(
            collected_news_id=news_id,
            success=True,
            article_id=article_ref.id,
            ai_job_id=job_id,
        )
    except Exception as exc:
        job_ref.update(
            {
                "status": "failed",
                "error": str(exc),
                "finishedAt": SERVER_TIMESTAMP,
            }
        )
        db.collection("collectedNews").document(news_id).update(
            {"status": "error"}
        )
        db.collection("activityLogs").add(
            {
                "type": "ai",
                "action": "process_failed",
                "userId": admin.uid,
                "collectedNewsId": news_id,
                "aiJobId": job_id,
                "detail": str(exc),
                "error": str(exc),
                "createdAt": SERVER_TIMESTAMP,
            }
        )
        return AiItemResult(
            collected_news_id=news_id,
            success=False,
            ai_job_id=job_id,
            error=str(exc),
        )


def run_ai_process(
    admin: AdminUser,
    *,
    collected_news_id: str | None = None,
    ids: list[str] | None = None,
) -> AiProcessResult:
    settings = get_settings()
    # Valida chave cedo
    _require_openai_client()

    batch = _fetch_collected_batch(
        collected_news_id,
        ids,
        limit=settings.ai_max_batch,
    )
    # Filtra já processados quando buscando lote por status
    if not collected_news_id and not ids:
        batch = [
            (nid, data)
            for nid, data in batch
            if not data.get("processedByAi")
        ]

    result = AiProcessResult()
    if not batch:
        return result

    for news_id, news in batch:
        item = _process_one(news_id, news, admin)
        result.processed += 1
        if item.success:
            result.succeeded += 1
        else:
            result.failed += 1
        result.items.append(item)

    return result
