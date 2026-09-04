# Checklist de Sprints — Memory Bank

> Marcar `- [x]` somente quando a sprint estiver concluída e validada.  
> Implementar **apenas** a sprint aprovada; não antecipar as seguintes.  
> Baseline atual (portal público + auth + layout) **não** substitui a Sprint 1 administrativa — deve ser reaproveitado.

---

## Sprint 0 — Baseline existente (já feito)

- [x] Setup React + Vite + TypeScript + Tailwind
- [x] Design system (cores da marca, componentes UI)
- [x] Firebase Auth (login/cadastro com nome e nascimento)
- [x] Roles admin/user + Firestore rules e indexes
- [x] Home pública e área autenticada do portal
- [x] Topbar, navbar, categorias, busca base, seletor de estado
- [x] Deploy Firebase Hosting

---

## Sprint 1 — Estrutura administrativa e controle de acesso

Objetivo: base do **painel administrativo** (ferramenta interna), sem área admin pública.

- [x] Separar rotas/superfícies: Portal (leitor) × Admin
- [x] Página de login administrativa (reutilizar Auth existente)
- [x] Cadastro/gestão de usuários administradores
- [x] Recuperação de acesso (reset de senha)
- [x] Guard de permissões: somente `role: admin` acessa o painel
- [x] Shell do painel administrativo (layout + navegação inicial)
- [x] Painel administrativo inicial (página home vazia ou placeholders reais)
- [x] Níveis de permissão admin (`full` / `view`)
- [x] Fluxos demonstrativos com mock: fontes, coletadas, revisão, publicações

**Nota:** login admin reutiliza o login do portal; `role: admin` redireciona ao dashboard. Dados operacionais atuais são mock de demonstração.

---

## Sprint 2 — Cadastro de fontes de conteúdo

Objetivo: módulo de fontes monitoradas.

- [x] CRUD de fontes (nome, site/portal, URL, RSS opcional, categorias, status)
- [x] Ativar / desativar fonte
- [x] Listagem e consulta de todas as fontes
- [x] Associação a categorias
- [x] Modelo Firestore `sources` (+ vínculo com `categories`)
- [x] Preparar arquitetura para RSS, site público e API (sem forçar um único tipo)

**Nota:** categorias iniciais seedadas a partir do menu do portal atual; lista oficial pode ser ajustada com o cliente.

---

## Sprint 3 — Coleta automatizada de notícias

Objetivo: rotina periódica que consulta fontes ativas e registra notícias novas.

- [x] Backend de coleta (FastAPI + Firebase Admin)
- [x] Prioridade: RSS → extração HTML → Playwright se necessário
- [x] Capturar: manchete, resumo, URL, imagem, data, fonte, categoria, ID
- [x] Anti-duplicidade (URL / ID feed / título / hash)
- [x] Persistência em `collectedNews` com status `collected`
- [x] Agendamento (Cloud Scheduler / Tasks) — **frequência ainda a definir com o cliente**
- [x] Logs de execução por fonte (encontrados, novos, duplicados, erros)
- [x] Falha isolada por fonte (não derruba o lote inteiro)

**Nota:** gatilho manual **Coletar agora** no admin (Scheduler pendente de frequência). Playwright fica como fallback futuro; nesta entrega RSS + HTML (Trafilatura/BS4). API de fonte específica ainda não implementada.

---

## Sprint 4 — Processamento por IA + Central de Revisão

Objetivo: transformar coletadas em artigos adaptados e revisar manualmente.

### IA editorial
- [x] Job de processamento (`aiJobs` / status `processing`)
- [x] Prompt com fatos + contexto editorial (quando existir `editorialProfile`)
- [x] Gerar título, resumo e corpo adaptados
- [x] Preservar fatos; sinalizar informação insuficiente
- [x] Manter vínculo com notícia/fonte original
- [x] Encaminhar para status `review`

### Central de Revisão
- [x] Lista de itens aguardando revisão
- [x] Comparar original × conteúdo adaptado
- [x] Ver fonte, imagem e metadados
- [x] Aprovar → `approved` / Rejeitar → `rejected`
- [x] Histórico de análises (`reviews` / `activityLogs`)
- [x] **Sem** publicação automática nesta sprint

**Nota:** provedor OpenAI (`gpt-4o-mini`), gatilho manual. Detalhes em `docs-ia/sprint4_ia.md`. Prompt neutro até haver perfil editorial (S8).
---

## Sprint 5 — Publicação no portal

Objetivo: enviar matérias aprovadas ao portal após integração definida.

- [ ] Definir com o cliente o canal de publicação (API / CMS / WordPress / outro)
- [ ] Enviar título, texto, resumo, imagem, categoria, data, status
- [ ] Associação à categoria e imagem principal
- [ ] Status `published` + registro em `publications`
- [ ] Tratamento de falha de publicação / API indisponível
- [ ] Organização cronológica no destino

---

## Sprint 6 — Monitoramento e controle operacional

Objetivo: rastreabilidade das automações e indicadores reais.

- [ ] Indicadores: capturadas, processadas, aprovadas, rejeitadas, publicadas
- [ ] Lista de atualizações/atividades recentes
- [ ] Registro detalhado de execuções (data, fonte, volumes, erros)
- [ ] Sem números fictícios permanentes
- [ ] Visão de erros por tipo (RSS inválido, fonte fora, IA, etc.)

---

## Sprint 7 — Dashboard demonstrativo e navegação consolidada

Objetivo: painel resumido para operação diária.

- [ ] Cards: total de fontes, fontes ativas, coletadas, em revisão, aprovadas, rejeitadas
- [ ] Últimas publicações e atividades recentes
- [ ] Navegação rápida: Dashboard, Fontes, Notícias, Revisão, Publicações, Configurações
- [ ] Dados 100% reais do Firestore / logs

---

## Sprint 8 (preparação / quando houver material do cliente) — Perfil editorial

Objetivo: formalizar o contexto de comunicação da IA.

- [ ] Coleção/config `editorialProfiles`
- [ ] Campos: tom, público, regras, exemplos, palavras preferidas/evitar
- [ ] Injetar perfil nos prompts de geração
- [ ] **Não** inventar estilo sem material do cliente

---

## Ordem de execução recomendada

```
S0 (feito) → S1 Admin Auth → S2 Fontes → S3 Coleta
→ S4 IA + Revisão → S5 Publicação → S6 Monitoramento → S7 Dashboard
→ S8 Perfil editorial (quando houver input)
```

## Critérios transversais (todas as sprints)

- [ ] Não recriar o que já funciona
- [ ] Não antecipar sprint futura
- [ ] Credenciais de IA apenas no backend
- [ ] Camadas independentes: coleta / IA / revisão / publicação
- [ ] Classificar novos pedidos (confirmado / futuro / pendência / decisão técnica)
