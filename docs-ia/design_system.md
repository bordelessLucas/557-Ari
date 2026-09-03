# Design System — Agência da Notícia

> Referência visual e tokens já aplicados no frontend. Evoluir sem abandonar a marca.

## Referências visuais

| Referência | Papel |
|------------|--------|
| **Agência da Notícia** (`agenciadanoticia.com.br`) | Site atual do cliente — header navy, nav vermelha, dropdown de categorias, feed com thumbnails |
| **Na Hora do Fato** | Modelo desejado — layout mais limpo, destaque principal, lista secundária, badges de categoria em vermelho, sidebar |
| **Logo oficial** | Retângulo com diagonal navy/vermelho, letras “an” em branco, texto “agência da notícia” |

Arquivo da logo no projeto: `public/logo.png`

---

## Estilo de UI

- **Tom:** portal jornalístico profissional, limpo e legível
- **Modo:** light mode (fundo claro); painéis de marca usam navy escuro
- **Admin (a construir):** clareza, poucos cliques, status bem visíveis, comparação original × IA
- **Portal (já iniciado):** home split-screen, navbar vermelha, tipografia neutra
- Evitar excesso de cards decorativos; priorizar hierarquia editorial
- Mobile-first nos fluxos de leitura e revisão

---

## Paleta de cores

### Marca

| Token | Hex | Uso |
|-------|-----|-----|
| `navy-600` | `#1e4976` | Primária — botões, foco, headers |
| `navy-700` | `#183a60` | Topbar autenticada |
| `navy-900` | `#122640` | Painel de marca / texto principal |
| `red-600` | `#c41e3a` | Accent — CTAs secundários, badges |
| `red-800` | `#8a172c` | Navbar principal do portal |

### Neutros e semânticos

| Token | Hex | Uso |
|-------|-----|-----|
| `background` | `#ffffff` | Fundo de páginas/cards |
| `muted` | `#f1f5f9` | Fundo suave |
| `muted-foreground` | `#64748b` | Texto secundário |
| `border` / `input` | `#e2e8f0` | Bordas e inputs |
| `success` | `#15803d` | Aprovação / sucesso |
| `warning` | `#b45309` | Atenção |
| `destructive` | `#c41e3a` | Erro / rejeição |

### Escalas disponíveis

- Navy: `50` → `950`
- Red: `50` → `950`

---

## Tipografia

| Uso | Fonte | Observação |
|-----|-------|------------|
| Interface e títulos | **Inter** | Sans-serif única, visual clean |
| Corpo | Inter 15px, line-height ~1.6 | Letter-spacing sutil (`-0.011em`) |

Pesos principais: 400 (corpo), 500 (labels), 600 (títulos/ações), 700 (destaques pontuais).

---

## Raios e sombras

| Token | Valor / papel |
|-------|----------------|
| `radius-sm` → `radius-2xl` | `0.375rem` … `1.25rem` — alinhado à logo arredondada |
| `shadow-card` | Cards e superfícies leves |
| `shadow-elevated` | Dropdowns, modais, menus |

---

## Componentes base (já no design system)

Local: `src/components/ui/`

- Button (primary navy, secondary red, outline, ghost, destructive)
- Input, Textarea, Label
- Card (+ Header/Title/Description/Content/Footer)
- Badge (categorias / status)
- Alert, Spinner, Separator
- Logo, Heading, Text
- Container, PageHeader, PageContent

Layout do portal: `AppLayout`, `MainNav`, `UserMenu`, `StateSelector`, `NavSearch`

---

## Padrões de interface por superfície

### Portal (leitor)
- Topbar navy + navbar vermelha
- Mega menu de categorias (3 colunas)
- Badges de categoria em vermelho (referência Na Hora do Fato)
- Busca expandível na navbar

### Painel administrativo (a construir)
- Navegação clara: Dashboard, Fontes, Notícias, Revisão, Publicações, Configurações
- Lista + detalhe para revisão (original × adaptado lado a lado quando possível)
- Status com cores semânticas (`review`, `approved`, `rejected`, `published`, `error`)
- Indicadores com dados reais

---

## Diretrizes

1. Reutilizar tokens e componentes existentes antes de criar novos.
2. Não introduzir tema purple/dark genérico; manter navy + red da marca.
3. Não definir tipografia editorial da IA enquanto o cliente não enviar exemplos.
4. Categorias visuais do menu atual são do portal; categorias oficiais de conteúdo serão as fornecidas pelo cliente.
