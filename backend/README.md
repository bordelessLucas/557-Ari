# Backend — Projeto Ari (coleta + IA + publicação)

API FastAPI: coleta de fontes (RSS/HTML), processamento editorial OpenAI,
revisão e publicação no portal.

## Setup

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

pip install -r requirements.txt
cp .env.example .env
```

Configure:
- `backend/serviceAccount.json` (Firebase Admin)
- `OPENAI_API_KEY` no `.env`
- `INTERNAL_API_SECRET` para rotas `/internal/*` (Scheduler)

**Não versionar** secrets.

## Rodar

```bash
uvicorn app.main:app --reload --port 8000
```

- Health: `GET /health`
- Ready: `GET /ready` (Firestore + flags de config)

## Endpoints (admin JWT)

### Coleta
- `POST /collect` — coleta todas as fontes ativas
- `POST /collect/{sourceId}` — coleta uma fonte

### IA
- `POST /ai/process` — processa lote de notícias `collected`
- `POST /ai/process/{collectedNewsId}` — um item
- `POST /review/{articleId}/approve`
- `POST /review/{articleId}/reject` — body opcional `{ "reason": "..." }`
- `POST /review/{articleId}/publish` — só `approved` → `published` + `publications`

Header: `Authorization: Bearer <Firebase ID token>`

## Endpoints internos (Scheduler)

Header: `X-Internal-Secret: <INTERNAL_API_SECRET>`

- `POST /internal/collect` → `202` `{ runId, status: queued }`
- `POST /internal/ai/process` → `202` `{ jobId, status: queued }`

Body opcional collect: `{ "source_id": "..." }`  
Body opcional AI: `{ "ids": [], "collected_news_id": null }`

## Docker / Cloud Run

```bash
docker build -t ari-api .
docker run -p 8080:8080 -e PORT=8080 --env-file .env ari-api
```

A imagem respeita a variável `PORT` (padrão Cloud Run).
