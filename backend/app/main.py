from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.firebase_admin_app import init_firebase
from app.routes.ai import router as ai_router
from app.routes.collect import router as collect_router
from app.routes.review import router as review_router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_firebase()
    yield


app = FastAPI(
    title="Ari API",
    version="0.2.0",
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


@app.get("/health")
async def health():
    return {"status": "ok", "service": "ari-api"}