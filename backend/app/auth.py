from dataclasses import dataclass

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth

from app.firebase_admin_app import get_db

security = HTTPBearer(auto_error=True)


@dataclass
class AdminUser:
    uid: str
    email: str | None
    role: str
    admin_permission: str | None
    is_principal: bool


async def require_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> AdminUser:
    token = credentials.credentials
    try:
        decoded = auth.verify_id_token(token)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado.",
        ) from exc

    uid = decoded.get("uid")
    if not uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token sem UID.",
        )

    db = get_db()
    snap = db.collection("users").document(uid).get()
    if not snap.exists:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Perfil de usuário não encontrado.",
        )

    data = snap.to_dict() or {}
    if data.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a administradores.",
        )

    return AdminUser(
        uid=uid,
        email=data.get("email") or decoded.get("email"),
        role="admin",
        admin_permission=data.get("adminPermission"),
        is_principal=bool(data.get("isPrincipal")),
    )


async def require_admin_full(admin: AdminUser = Depends(require_admin)) -> AdminUser:
    if admin.is_principal or admin.admin_permission == "full":
        return admin
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Permissão de edição necessária para coletar notícias.",
    )
