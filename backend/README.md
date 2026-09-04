# Backend — Projeto Ari (coleta + IA)

API FastAPI: coleta de fontes (RSS/HTML) e processamento editorial OpenAI,
com aprovação/rejeição na central de revisão.

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

**Não versionar** secrets.

## Rodar

```bash
uvicorn app.main:app --reload --port 8000
```

Health: `GET http://localhost:8000/health`

## Endpoints (admin JWT)

### Coleta
- `POST /collect` — coleta todas as fontes ativas
- `POST /collect/{sourceId}` — coleta uma fonte

### IA (Sprint 4)
- `POST /ai/process` — processa lote de notícias `collected`
- `POST /ai/process/{collectedNewsId}` — um item
- `POST /review/{articleId}/approve`
- `POST /review/{articleId}/reject` — body opcional `{ "reason": "..." }`

Header: `Authorization: Bearer <Firebase ID token>`

Env IA: `OPENAI_API_KEY`, `OPENAI_MODEL=gpt-4o-mini`

## Docker (Cloud Run futuro)

```bash
docker build -t ari-api .
docker run -p 8000:8000 --env-file .env ari-api
```
