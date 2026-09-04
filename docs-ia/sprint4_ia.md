# Sprint 4 — IA editorial + Central de Revisão

> Decisões técnicas e alinhamentos com o cliente. Atualizar quando o escopo estrutural mudar.

## Decisões confirmadas (implementação)

| Tema | Valor |
|------|--------|
| Provedor | OpenAI (SDK no backend) |
| Modelo padrão | `gpt-4o-mini` (env `OPENAI_MODEL`) |
| Prompt | `editorial_v1` (neutro PT-BR; sem inventar fatos) |
| Gatilho | Manual no admin (`POST /ai/process`) |
| Auth | Firebase ID token + admin `full` |
| Credencial | `OPENAI_API_KEY` apenas no backend |
| Publicação | **Não** nesta sprint |

## Endpoints

- `POST /ai/process` — processa lote de `collectedNews` com status `collected`
- `POST /ai/process/{collectedNewsId}` — um item
- `POST /review/{articleId}/approve`
- `POST /review/{articleId}/reject` body opcional `{ "reason": "..." }`

## Coleções

- `aiJobs` — job por item processado
- `articles` — versão adaptada (`review` / `approved` / `rejected`)
- `reviews` — auditoria de decisão
- `collectedNews.status` — `collected` → `processing` → (sucesso mantém vínculo) / `error` em falha

## Pontos pendentes com o cliente

1. Conta/billing OpenAI e limites
2. Confirmar modelo (`gpt-4o-mini` vs `gpt-4o`)
3. Gatilho automático pós-coleta (hoje: manual)
4. Volume esperado de matérias/dia
5. Tom/regionalismos → Sprint 8 (`editorialProfiles`)
6. Regras de uso de imagens → Sprint 5+
7. Edição livre do texto na revisão (S4: aprovar/rejeitar; edição leve incluída na UI se implementada)

## Fora do escopo S4

- Publicação / feed do portal (S5)
- Perfil editorial completo (S8)
- Scheduler de IA
