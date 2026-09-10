# Deploy da API Ari (FastAPI) no Cloud Run — checklist operacional
#
# Hoje: só Firebase Hosting (front). A API NÃO está publicada.
# Sem Cloud Run, coleta/IA/aprovar via API ficam só no PC (uvicorn local).

## Pré-requisitos
1. Google Cloud SDK (`gcloud`) instalado e logado no projeto `ari-b0f40`
2. APIs habilitadas: Cloud Run, Artifact Registry, Cloud Build
3. `backend/serviceAccount.json` (Firebase Admin) — NÃO commitado
4. Docker local OU Cloud Build

## Variáveis no Cloud Run
- FIREBASE_PROJECT_ID=ari-b0f40
- FIREBASE_SERVICE_ACCOUNT_JSON=<conteúdo JSON da service account>  (preferível ao arquivo)
- CORS_ORIGINS=https://ari-b0f40.web.app,https://ari-b0f40.firebaseapp.com,http://localhost:5173,http://127.0.0.1:5173
- INTERNAL_API_SECRET=<segredo forte>
- OPENAI_API_KEY= (opcional; sem chave = passthrough)
- AI_MODE=auto

## Build + deploy (exemplo)
```bash
cd backend
gcloud builds submit --tag southamerica-east1-docker.pkg.dev/ari-b0f40/ari/ari-api
gcloud run deploy ari-api \
  --image southamerica-east1-docker.pkg.dev/ari-b0f40/ari/ari-api \
  --region southamerica-east1 \
  --allow-unauthenticated \
  --set-env-vars "FIREBASE_PROJECT_ID=ari-b0f40,AI_MODE=auto,CORS_ORIGINS=https://ari-b0f40.web.app,https://ari-b0f40.firebaseapp.com"
# + secrets para FIREBASE_SERVICE_ACCOUNT_JSON / INTERNAL_API_SECRET / OPENAI_API_KEY
```

## Front (Hosting) depois da API
1. Anote a URL do Cloud Run (ex.: https://ari-api-xxxxx-rj.a.run.app)
2. Build com `VITE_API_URL=https://ari-api-xxxxx-rj.a.run.app`
3. `firebase deploy --only hosting --project ari-b0f40`

## Enquanto isso
- Portal/admin no Hosting: Firestore OK (ler/publicar dados já no banco)
- Coletar / Preparar IA / Aprovar via botões de API: use http://127.0.0.1:5173 + uvicorn
