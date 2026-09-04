from pydantic import BaseModel, Field

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import AdminUser, require_admin_full
from app.services.review_service import approve_article, reject_article

router = APIRouter(prefix="/review", tags=["review"])


class RejectBody(BaseModel):
    reason: str | None = Field(default=None, max_length=2000)


@router.post("/{article_id}/approve")
async def approve(
    article_id: str,
    admin: AdminUser = Depends(require_admin_full),
):
    try:
        return approve_article(article_id, admin)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Falha ao aprovar: {exc}",
        ) from exc


@router.post("/{article_id}/reject")
async def reject(
    article_id: str,
    body: RejectBody | None = None,
    admin: AdminUser = Depends(require_admin_full),
):
    try:
        return reject_article(
            article_id,
            admin,
            reason=body.reason if body else None,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Falha ao rejeitar: {exc}",
        ) from exc
