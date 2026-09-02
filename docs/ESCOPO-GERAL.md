# Escopo Geral do Projeto — Sistema de Atualização Automática de Notícias

> Documento de referência para todas as sprints. Não implementar funcionalidades fora do escopo da sprint atual.

## Referências visuais

| Referência | Descrição |
|---|---|
| **Agência da Notícia** (`agenciadanoticia.com.br`) | Site **atual do cliente** — portal de notícias de Mato Grosso. Layout tradicional: header azul marinho, nav vermelha, dropdown de categorias, feed de notícias com thumbnails. |
| **Na Hora do Fato** | **Modelo de referência** que o cliente gosta — layout mais limpo: logo com relógio, nav vermelha, destaque principal à esquerda, lista secundária ao centro, sidebar com ads à direita, badges de categoria em vermelho. |

## Visão geral

Sistema administrativo para automatizar coleta, análise, geração, revisão e publicação de notícias em um portal.

### Fluxo principal

```
Fontes cadastradas
  → coleta automática
  → armazenamento da notícia original
  → validação de duplicidade
  → análise da IA
  → classificação de relevância
  → geração do artigo
  → armazenamento como rascunho
  → revisão administrativa
  → aprovação ou rejeição
  → publicação no portal
  → registro da publicação e histórico
```

### Capacidades da IA

- Identificar assunto e categoria
- Avaliar relevância
- Filtrar conteúdos irrelevantes
- Detectar duplicatas/conteúdos semelhantes
- Usar uma ou mais fontes como referência
- Criar novos artigos a partir das informações coletadas
- Adaptar linguagem ao padrão editorial
- Melhorar título, estrutura e clareza
- Gerar resumo, tags e SEO básico
- Manter fontes vinculadas ao artigo

### Perfil editorial

Configuração de tom de voz, estilo, público-alvo, tamanho dos artigos, assuntos prioritários e conteúdos a evitar. Comportamento controlado por **prompts** (sem modelo próprio treinado inicialmente).

### Revisão editorial

Artigos gerados pela IA ficam como **rascunho** → central de revisão → admin visualiza original + fontes + artigo IA → editar / aprovar / rejeitar → histórico completo.

### Publicação

Após aprovação, envio ao portal via integração desacoplada (API própria, WordPress REST API ou outra).

---

## Stack definida

### Frontend
- React, Vite, TypeScript, Tailwind CSS, **shadcn/ui**

### Firebase (persistência principal)
- Authentication, Cloud Firestore, Storage, Security Rules, Admin SDK

### Backend
- Python, FastAPI, Firebase Admin SDK
- **Google Cloud Run**

### Automação
- Google Cloud Scheduler, Cloud Tasks e/ou Pub/Sub

### Coleta de conteúdo
Prioridade: **RSS → extração HTML → Playwright (somente se necessário)**

- feedparser (RSS)
- Trafilatura (extração)
- BeautifulSoup (HTML)
- Playwright (apenas quando JS for obrigatório)

### Inteligência Artificial
- OpenAI API, prompts editoriais, contexto editorial
- RAG e embeddings quando necessário (duplicidade semântica)
- **Chamadas de IA somente no backend** — credenciais nunca no frontend

---

## Módulos do sistema

1. Autenticação e controle de acesso
2. Dashboard administrativo
3. Cadastro e gerenciamento de fontes
4. Cadastro e gerenciamento de categorias
5. Coleta automática de notícias
6. Central de notícias coletadas
7. Processamento e classificação por IA
8. Configuração do perfil editorial
9. Geração de artigos com IA
10. Detecção de duplicados/relacionados
11. Central de revisão editorial
12. Aprovação e rejeição de artigos
13. Publicação no portal
14. Histórico e registros de atividades
15. Monitoramento das automações
16. Configurações gerais do sistema

---

## Estrutura inicial Firestore

```
users
sources
categories
collectedNews
articles
reviews
publications
aiJobs
activityLogs
editorialProfiles
portalSettings
```

Evitar duplicação; preferir referências entre documentos.

---

## Regras gerais de desenvolvimento

- Desenvolvimento **incremental por sprints**
- Analisar cada sprint em conjunto com este escopo e o que já foi implementado
- **Não** reconstruir funcionalidades prontas sem necessidade
- **Não** remover funcionalidades existentes para implementar nova sprint
- **Não** alterar stack principal sem necessidade técnica real
- **Não** adicionar funcionalidades fora do escopo/sprint atual
- **Não** criar mocks permanentes quando já houver integração real
- **Não** expor chaves/tokens/credenciais no frontend ou repositório
- Código organizado, proporcional à etapa (evitar overengineering)
- Reutilizar serviços, componentes, coleções, tipos e funções existentes
- Firebase como base de auth, persistência e storage
- Prioridade: **MVP funcional**, evoluindo progressivamente
- Implementar **somente o necessário** para a sprint atual, preparando arquitetura para próximas etapas sem antecipar funcionalidades

---

## Estado atual do repositório (baseline)

- Setup inicial: React + Vite + TypeScript + Tailwind CSS v4
- Firebase Auth integrado (login/cadastro e-mail e senha)
- **Pendente para próximas sprints:** shadcn/ui, Firestore, backend Python/FastAPI, demais módulos
