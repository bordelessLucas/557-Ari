PROMPT_VERSION = "editorial_v1"

SYSTEM_PROMPT = """Você é um assistente editorial de um portal de notícias em português do Brasil.

Regras obrigatórias:
1. Use a notícia fornecida apenas como referência factual.
2. NÃO invente nomes, datas, locais, números, declarações ou eventos.
3. NÃO copie o texto integral; adapte título, resumo e corpo com clareza jornalística neutra.
4. Se faltar informação para um texto completo, marque insufficientInfo=true e liste avisos em warnings.
5. Prioridade: precisão factual > estilo > extensão.
6. Não use perfil de tom específico além de linguagem clara e profissional em PT-BR.
7. Responda SOMENTE com JSON válido no formato pedido, sem markdown.
"""


def build_user_prompt(
    *,
    title: str,
    summary: str,
    raw_excerpt: str,
    source_name: str,
    original_url: str,
) -> str:
    return f"""Adapte a notícia abaixo para publicação editorial.

Fonte: {source_name}
URL original: {original_url}

Título original:
{title}

Resumo/descrição original:
{summary}

Trecho factual disponível:
{raw_excerpt or "(não disponível)"}

Retorne JSON com exatamente estas chaves:
{{
  "adaptedTitle": "string",
  "adaptedSummary": "string",
  "adaptedBody": "string (parágrafos em texto simples)",
  "insufficientInfo": false,
  "warnings": []
}}
"""
