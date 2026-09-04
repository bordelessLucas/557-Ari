from pydantic import BaseModel, Field

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import AdminUser, require_admin_full
from app.services.ai_processor import run_ai_process

router = APIRouter(prefix="/ai", tags=["ai"])


class ProcessBatchBody(BaseModel):
    ids: list[str] | None = Field(default=None)


@router.post("/process")
async def process_batch(
    body: ProcessBatchBody | None = None,
    admin: AdminUser = Depends(require_admin_full),
):
    try:
        result = run_ai_process(
            admin,
            ids=(body.ids if body else None),
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Falha no processamento de IA: {exc}",
        ) from exc
    return result.to_dict()


@router.post("/process/{collected_news_id}")
async def process_one(
    collected_news_id: str,
    admin: AdminUser = Depends(require_admin_full),
):
    try:
        result = run_ai_process(admin, collected_news_id=collected_news_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Falha no processamento de IA: {exc}",
        ) from exc
    return result.to_dict()
