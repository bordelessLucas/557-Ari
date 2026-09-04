from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import AdminUser, require_admin_full
from app.services.collect_runner import run_collection

router = APIRouter(prefix="/collect", tags=["collect"])


@router.post("")
async def collect_all(admin: AdminUser = Depends(require_admin_full)):
    try:
        result = run_collection(admin)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Falha na coleta: {exc}",
        ) from exc

    return result.to_dict()


@router.post("/{source_id}")
async def collect_one(
    source_id: str,
    admin: AdminUser = Depends(require_admin_full),
):
    try:
        result = run_collection(admin, source_id=source_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Falha na coleta: {exc}",
        ) from exc

    return result.to_dict()
