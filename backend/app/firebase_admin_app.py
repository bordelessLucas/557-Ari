import json
import os
from pathlib import Path

import firebase_admin
from firebase_admin import credentials, firestore

from app.config import get_settings

_db = None


def init_firebase() -> None:
    global _db
    if firebase_admin._apps:
        _db = firestore.client()
        return

    settings = get_settings()
    cred = None

    if settings.firebase_service_account_json:
        info = json.loads(settings.firebase_service_account_json)
        cred = credentials.Certificate(info)
    else:
        path = settings.google_application_credentials or os.getenv(
            "GOOGLE_APPLICATION_CREDENTIALS"
        )
        if path and Path(path).exists():
            cred = credentials.Certificate(path)
        else:
            # Fallback: serviceAccount.json ao lado do backend/
            local = Path(__file__).resolve().parents[1] / "serviceAccount.json"
            if local.exists():
                cred = credentials.Certificate(str(local))

    if cred is None:
        raise RuntimeError(
            "Firebase Admin não configurado. Defina GOOGLE_APPLICATION_CREDENTIALS, "
            "FIREBASE_SERVICE_ACCOUNT_JSON ou coloque backend/serviceAccount.json."
        )

    firebase_admin.initialize_app(
        cred,
        {"projectId": settings.firebase_project_id},
    )
    _db = firestore.client()


def get_db():
    if _db is None:
        init_firebase()
    return _db
