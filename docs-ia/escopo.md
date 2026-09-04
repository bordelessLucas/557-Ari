# Escopo — Sistema de Atualização Automática de Notícias

> Memory Bank vivo. Priorizar sempre o escopo mais recente aprovado pelo cliente.

## Objetivo principal

Criar uma plataforma para **monitorar, coletar, revisar, adaptar (IA) e publicar notícias** em um portal, com controle humano na Central de Revisão.

Fluxo confirmado:

```
Fonte monitorada
→ Notícia identificada
→ Conteúdo coletado
→ IA analisa
→ IA adapta/redige
→ Central de Revisão
→ Admin aprova ou rejeita
→ Matéria aprovada é publicada no portal
```

A primeira versão prioriza **controle, revisão e rastreabilidade**.  
Publicação totalmente automática **não** faz parte do escopo inicial.

---

## Stack do projeto (já definida)

| Camada | Tecnologia |
|--------|------------|
| Frontend | React, Vite, TypeScript, Tailwind CSS, shadcn/ui |
| Persistência | Firebase Auth, Firestore, Storage, Security Rules |
| Backend | Python, FastAPI, Firebase Admin SDK |
| Infra | Google Cloud Run, Cloud Scheduler, Cloud Tasks/Pub/Sub |
| Coleta | RSS (feedparser) → Trafilatura/BS4 → Playwright (último recurso) |
| IA | API de IA **somente no backend** (provedor/modelo ainda pendentes) |

> Este projeto é **web** (não Expo/mobile). O portal e o painel administrativo compartilham o frontend React.

---

## Perfis de usuário

| Perfil | Descrição | Acesso |
|--------|-----------|--------|
| **Admin** | Responsável pelo portal e pela operação editorial | Painel administrativo completo: fontes, coleta, revisão, publicação, monitoramento, configurações |
| **User (leitor)** | Usuário autenticado do portal público | Consumo de notícias, perfil básico, seletor de estado — **sem** gestão administrativa |

Regras:

- Área administrativa exige autenticação.
- Não criar acesso público às funções de gestão.
- Novos cadastros padrão: `role: user`. Promoção a admin é decisão operacional (não self-service).

---

## Regras de negócio claras

### Coleta e fontes
- Admin cadastra e controla as fontes monitoradas.
- A IA **não** pesquisa fontes externas além das cadastradas, salvo autorização explícita.
- Nem toda fonte possui RSS; integrações especiais são tratadas caso a caso.
- Evitar reprocessar a mesma matéria (URL, ID do feed, título, data, hash — estratégia definitiva na implementação).
- Falha em uma fonte **não** interrompe as demais.

### Inteligência Artificial
- IA atua como **assistente editorial**, não como copiadora.
- Usa a notícia como **referência factual** e adapta ao padrão do portal.
- Preservar: nomes, datas, locais, valores, declarações, eventos e contexto factual.
- **Não inventar** informações. Conteúdo insuficiente → sinalizar para revisão.
- Prioridade: **Precisão factual > estilo > velocidade**.
- Estilo editorial só após o cliente fornecer exemplos/regras.

### Revisão e publicação
- Toda matéria gerada pela IA entra em revisão com status de aguardando análise.
- Publicação somente após **aprovação manual**.
- Manter vínculo com a fonte/notícia original.
- Forma técnica de publicação no portal ainda **pendente** (API própria, CMS, WordPress REST, etc.).

### Imagens
- Pode capturar imagem destacada (URL, fonte, vínculo).
- Não assumir reutilização livre; respeitar regras do portal (ainda a definir).

### Operação
- Dashboard e indicadores com **dados reais** — sem números fictícios permanentes.
- Registrar execuções automáticas (data, fonte, novos, duplicados, erros).
- Separar camadas: coleta → IA → revisão → publicação.

---

## Status conceituais do conteúdo

| Status | Significado |
|--------|-------------|
| `collected` | Notícia capturada da fonte |
| `processing` | Em processamento pela IA |
| `review` | Aguardando revisão administrativa |
| `approved` | Aprovada para publicação |
| `rejected` | Rejeitada |
| `published` | Publicada no portal |
| `error` | Falha em alguma etapa |

Nomes técnicos podem ser adaptados; a rastreabilidade é obrigatória.

---

## Entidades principais

| Entidade | Função |
|----------|--------|
| Usuários | Admins e leitores autenticados |
| Fontes | Sites/portais/feeds monitorados |
| Categorias | Classificação editorial |
| Notícias coletadas | Conteúdo bruto das fontes |
| Artigos gerados | Versões adaptadas pela IA |
| Revisões | Aprovações e rejeições |
| Publicações | Conteúdos enviados ao portal |
| Execuções | Histórico das rotinas automáticas |
| Perfil editorial | Contexto de tom/estilo (futuro) |

Coleções Firestore previstas: `users`, `sources`, `categories`, `collectedNews`, `articles`, `reviews`, `publications`, `aiJobs`, `activityLogs`, `editorialProfiles`, `portalSettings`.

---

## Funcionalidades core (confirmadas)

1. Autenticação e controle de acesso administrativo
2. Cadastro e gestão de fontes (RSS/site, categorias, ativo/inativo)
3. Coleta periódica automatizada com anti-duplicidade
4. Processamento por IA (título, resumo, corpo adaptado)
5. Central de revisão (comparar original × IA; aprovar/rejeitar)
6. Publicação no portal após aprovação
7. Monitoramento, logs de execução e dashboard operacional
8. Categorias compartilhadas entre fontes, coletadas e publicadas
9. Preparação para perfil editorial (`editorialProfile`)

---

## Já implementado (baseline do repositório)

Não recriar sem necessidade:

- Setup React + Vite + TS + Tailwind + design system
- Firebase Auth (login/cadastro com nome e data de nascimento)
- Roles `admin` / `user` + Firestore rules e indexes
- Home pública + área autenticada do portal
- Topbar, navbar (categorias, busca base), seletor de estado, menu de conta
- Hosting Firebase (`https://ari-b0f40.web.app`)

**Já na Sprint 1–4:** painel admin, permissões full/view, CRUD de fontes, coleta → `collectedNews`, processamento OpenAI → `articles` + central de revisão (aprovar/rejeitar sem publicar).

**Pendente em relação ao escopo admin:** publicação no portal, dashboard operacional 100% real, perfil editorial completo.

Detalhes técnicos da IA: `docs-ia/sprint4_ia.md`.

---

## Pendências (não assumir)

- Nome definitivo / identidade editorial escrita do portal
- Tecnologia/CMS do portal e forma de publicação
- Lista inicial de fontes e categorias oficiais
- Frequência de coleta e de processamento automático por IA
- Confirmação definitiva do modelo OpenAI (`gpt-4o-mini` default técnico)
- Volume esperado de notícias/dia e limites de billing
- Regras de uso de imagens e SEO
- Publicação automática sem revisão (futuro)
- Níveis detalhados de permissão além de admin full/view

---

## Classificação de novos requisitos

Ao receber demandas, classificar como:

- Requisito confirmado
- Regra editorial
- Funcionalidade atual
- Funcionalidade futura
- Integração externa
- Automação
- Pendência
- Decisão técnica
