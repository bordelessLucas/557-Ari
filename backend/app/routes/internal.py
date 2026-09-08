from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, Header, HTTPException, status
from pydantic import BaseModel, Field

from app.config import get_settings
from app.firebase_admin_app import get_db
from app.services.ai_processor import run_ai_process
from app.services.collect_runner import run_collection

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/internal", tags=["internal"])


def require_internal_secret(
    x_internal_secret: str | None = Header(default=None, alias="X-Internal-Secret"),
) -> None:
    settings = get_settings()
    expected = (settings.internal_api_secret or "").strip()
    if not expected:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="INTERNAL_API_SECRET não configurada no backend.",
        )
    if not x_internal_secret or x_internal_secret != expected:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Secret interno inválido.",
        )


class InternalCollectBody(BaseModel):
    source_id: str | None = None


class InternalAiBody(BaseModel):
    ids: list[str] = Field(default_factory=list)
    collected_news_id: str | None = None


def _run_collect_job(run_id: str, source_id: str | None) -> None:
    try:
        logger.info("internal collect start runId=%s sourceId=%s", run_id, source_id)
        result = run_collection(
            None,
            source_id=source_id,
            triggered_by="scheduler",
            triggered_by_email="internal@system",
        )
        # Sobrescreve runId gerado internamente nos logs já escritos —
        # o run_collection cria o próprio id; registramos o enfileirado.
        logger.info(
            "internal collect done enqueueId=%s actualRunId=%s created=%s",
            run_id,
            result.run_id,
            result.total_created,
        )
        get_db().collection("collectionRuns").document(run_id).set(
            {
                "status": "succeeded",
                "actualRunId": result.run_id,
                "totalFound": result.total_found,
                "totalCreated": result.total_created,
                "totalDuplicated": result.total_duplicated,
                "finishedAt": datetime.now(timezone.utc),
            },
            merge=True,
        )
    except Exception as exc:
        logger.exception("internal collect failed runId=%s", run_id)
        get_db().collection("collectionRuns").document(run_id).set(
            {
                "status": "failed",
                "error": str(exc),
                "finishedAt": datetime.now(timezone.utc),
            },
            merge=True,
        )


def _run_ai_job(job_id: str, collected_news_id: str | None, ids: list[str]) -> None:
    try:
        logger.info("internal ai start jobId=%s", job_id)
        result = run_ai_process(
            None,
            collected_news_id=collected_news_id,
            ids=ids or None,
            triggered_by="scheduler",
        )
        get_db().collection("aiJobs").document(job_id).set(
            {
                "status": "succeeded",
                "processed": result.processed,
                "succeeded": result.succeeded,
                "failed": result.failed,
                "finishedAt": datetime.now(timezone.utc),
                "batch": True,
            },
            merge=True,
        )
        logger.info(
            "internal ai done jobId=%s processed=%s succeeded=%s failed=%s",
            job_id,
            result.processed,
            result.succeeded,
            result.failed,
        )
    except Exception as exc:
        logger.exception("internal ai failed jobId=%s", job_id)
        get_db().collection("aiJobs").document(job_id).set(
            {
                "status": "failed",
                "error": str(exc),
                "finishedAt": datetime.now(timezone.utc),
                "batch": True,
            },
            merge=True,
        )


@router.post("/collect", status_code=status.HTTP_202_ACCEPTED)
async def internal_collect(
    background_tasks: BackgroundTasks,
    body: InternalCollectBody | None = None,
    _: None = Depends(require_internal_secret),
):
    run_id = datetime.now(timezone.utc).strftime("enq%Y%m%dT%H%M%S%f")
    source_id = body.source_id if body else None
    get_db().collection("collectionRuns").document(run_id).set(
        {
            "runId": run_id,
            "status": "queued",
            "triggeredBy": "scheduler",
            "triggeredByEmail": "internal@system",
            "sourceId": source_id,
            "createdAt": datetime.now(timezone.utc),
        }
    )
    background_tasks.add_task(_run_collect_job, run_id, source_id)
    return {"runId": run_id, "status": "queued"}


@router.post("/ai/process", status_code=status.HTTP_202_ACCEPTED)
async def internal_ai_process(
    background_tasks: BackgroundTasks,
    body: InternalAiBody | None = None,
    _: None = Depends(require_internal_secret),
):
    job_id = datetime.now(timezone.utc).strftime("aienq%Y%m%dT%H%M%S%f")
    collected_news_id = body.collected_news_id if body else None
    ids = body.ids if body else []
    get_db().collection("aiJobs").document(job_id).set(
        {
            "status": "queued",
            "batch": True,
            "triggeredBy": "scheduler",
            "collectedNewsId": collected_news_id,
            "ids": ids,
            "createdAt": datetime.now(timezone.utc),
        }
    )
    background_tasks.add_task(_run_ai_job, job_id, collected_news_id, ids)
    return {"jobId": job_id, "status": "queued"}
