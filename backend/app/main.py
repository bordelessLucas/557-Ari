from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.firebase_admin_app import firebase_configured, get_db, init_firebase
from app.logging_config import setup_logging
from app.routes.ai import router as ai_router
from app.routes.collect import router as collect_router
from app.routes.internal import router as internal_router
from app.routes.review import router as review_router

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    setup_logging()
    if firebase_configured():
        try:
            init_firebase()
            logger.info("Firebase Admin inicializado")
        except Exception as exc:
            logger.error("Falha ao inicializar Firebase: %s", exc)
    else:
        logger.warning(
            "serviceAccount ausente — /health sobe, mas coleta/IA/revisão "
            "falharão até configurar backend/serviceAccount.json"
        )
    yield


app = FastAPI(
    title="Ari API",
    version="0.3.1",
    lifespan=lifespan,
)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(collect_router)
app.include_router(ai_router)
app.include_router(review_router)
app.include_router(internal_router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "ari-api"}


@app.get("/ready")
async def ready():
    checks: dict[str, str] = {
        "service_account": "ok" if firebase_configured() else "missing",
        "openai_key": "ok" if settings.openai_api_key else "missing",
        "ai_mode": settings.effective_ai_mode,
        "internal_secret": (
            "ok" if settings.internal_api_secret else "missing"
        ),
        "firestore": "skipped",
    }
    if firebase_configured():
        try:
            get_db().collection("sources").limit(1).get()
            checks["firestore"] = "ok"
        except Exception as exc:
            logger.warning("ready firestore check failed: %s", exc)
            checks["firestore"] = "error"
    ok = checks["service_account"] == "ok" and checks["firestore"] == "ok"
    return {
        "status": "ready" if ok else "degraded",
        "checks": checks,
        # OpenAI opcional nesta sprint — passthrough cobre o fluxo editorial
        "pipeline_ready": ok,
    }
