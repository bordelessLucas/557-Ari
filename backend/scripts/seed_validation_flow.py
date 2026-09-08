"""
Seed de validação do fluxo editorial (mock realista no Firestore).

Cria dados no mesmo shape da API:
  sources → collectedNews → aiJobs/articles → reviews/publications

Uso (na pasta backend, com venv e serviceAccount):
  python -m scripts.seed_validation_flow
"""

from __future__ import annotations

import hashlib
from datetime import datetime, timedelta, timezone

from google.cloud import firestore

from app.firebase_admin_app import get_db, init_firebase

ADMIN_UID = "bD4SQmUsCuVookdrUCY4JFBO9Cp2"
ADMIN_EMAIL = "admin@an.com"

CATEGORIES = [
    ("agronegocio", "Agronegócio"),
    ("artigos-e-opiniao", "Artigos e Opinião"),
    ("cidades", "Cidades"),
    ("economia", "Economia"),
    ("educacao", "Educação"),
    ("entrevista", "Entrevista"),
    ("esporte", "Esporte"),
    ("geral", "Geral"),
    ("internauta-an", "Internauta AN"),
    ("judiciario", "Judiciário"),
    ("nos-bastidores", "Nos Bastidores"),
    ("operacao-lava-jato", "Operação Lava Jato"),
    ("policia", "Polícia"),
    ("politica", "Política"),
    ("saude", "Saúde"),
    ("eleicoes-2026", "Eleições 2026"),
]


def _hash(url: str, title: str) -> str:
    base = f"{url}|{title.strip().lower()}"
    return hashlib.sha256(base.encode("utf-8")).hexdigest()


def _img(seed: str) -> str:
    return f"https://picsum.photos/seed/{seed}/960/540"


def seed() -> None:
    init_firebase()
    db = get_db()
    now = datetime.now(timezone.utc)

    # ── Fontes ────────────────────────────────────────────────
    sources_spec = [
        {
            "id": "src-demo-rss-mt",
            "name": "Demo RSS — Agência MT",
            "siteUrl": "https://www.agenciadanoticia.com.br",
            "rssUrl": "https://www.agenciadanoticia.com.br/feed",
            "kind": "rss",
        },
        {
            "id": "src-demo-site-sp",
            "name": "Demo Site — Portal SP",
            "siteUrl": "https://example.com/noticias",
            "rssUrl": "",
            "kind": "website",
        },
    ]

    for src in sources_spec:
        db.collection("sources").document(src["id"]).set(
            {
                "name": src["name"],
                "siteUrl": src["siteUrl"],
                "rssUrl": src["rssUrl"],
                "apiUrl": "",
                "kind": src["kind"],
                "categoryIds": ["geral", "politica"],
                "status": "active",
                "newsCount": 0,
                "lastCheckedAt": now - timedelta(hours=2),
                "createdBy": ADMIN_UID,
                "createdAt": now - timedelta(days=3),
                "updatedAt": now - timedelta(hours=2),
            },
            merge=True,
        )

    source_a = sources_spec[0]
    source_b = sources_spec[1]

    published_ids: list[str] = []
    review_ids: list[str] = []
    collected_pending = 0

    batch_notes: list[str] = []

    # ── 1 publicada por categoria (Home + Publicações) ────────
    for index, (slug, label) in enumerate(CATEGORIES):
        src = source_a if index % 2 == 0 else source_b
        title = f"[{label}] Matéria de validação #{index + 1:02d}"
        summary = (
            f"Resumo editorial de teste para a categoria {label}. "
            "Usado para validar feed, busca, revisão e publicação."
        )
        body = (
            f"{summary}\n\n"
            f"Parágrafo 2 — conteúdo adaptado (passthrough/IA) da categoria {label}. "
            "Este texto simula o corpo completo que o portal exibe na página da matéria.\n\n"
            "Parágrafo 3 — estrutura pronta para receber volume maior nas próximas sprints."
        )
        url = f"https://example.com/mock/{slug}/validacao-{index + 1}"
        digest = _hash(url, title)
        collected_id = f"cn-pub-{slug}"
        article_id = f"art-pub-{slug}"
        job_id = f"job-pub-{slug}"
        pub_id = f"pub-{slug}"
        review_id = f"rev-pub-{slug}"
        published_at = now - timedelta(hours=index + 1)

        db.collection("collectedNews").document(collected_id).set(
            {
                "title": title,
                "summary": summary,
                "originalUrl": url,
                "imageUrl": _img(slug),
                "publishedAt": published_at - timedelta(hours=1),
                "collectedAt": published_at - timedelta(minutes=50),
                "sourceId": src["id"],
                "sourceName": src["name"],
                "categoryIds": [slug],
                "externalId": f"ext-{slug}",
                "contentHash": digest,
                "status": "published",
                "rawExcerpt": body[:800],
                "triggeredBy": ADMIN_UID,
                "processedByAi": True,
                "lastAiJobId": job_id,
                "lastArticleId": article_id,
                "aiProcessedAt": published_at - timedelta(minutes=40),
            }
        )

        db.collection("aiJobs").document(job_id).set(
            {
                "collectedNewsId": collected_id,
                "status": "succeeded",
                "error": None,
                "tokensUsage": {"promptTokens": 120, "completionTokens": 80, "totalTokens": 200},
                "model": "passthrough",
                "promptVersion": "passthrough_v1",
                "triggeredBy": ADMIN_UID,
                "articleId": article_id,
                "createdAt": published_at - timedelta(minutes=45),
                "finishedAt": published_at - timedelta(minutes=40),
            }
        )

        db.collection("articles").document(article_id).set(
            {
                "collectedNewsId": collected_id,
                "sourceId": src["id"],
                "sourceName": src["name"],
                "originalUrl": url,
                "originalTitle": title,
                "originalSummary": summary,
                "imageUrl": _img(slug),
                "categoryIds": [slug],
                "adaptedTitle": title,
                "adaptedSummary": summary,
                "adaptedBody": body,
                "insufficientInfo": False,
                "aiWarnings": ["Seed de validação — conteúdo mock estrutural."],
                "status": "published",
                "aiJobId": job_id,
                "model": "passthrough",
                "promptVersion": "passthrough_v1",
                "createdAt": published_at - timedelta(minutes=40),
                "updatedAt": published_at,
                "reviewedAt": published_at - timedelta(minutes=5),
                "reviewedBy": ADMIN_UID,
                "rejectionReason": None,
                "publishedAt": published_at,
                "publishedBy": ADMIN_UID,
            }
        )

        db.collection("reviews").document(review_id).set(
            {
                "articleId": article_id,
                "decision": "approved",
                "userId": ADMIN_UID,
                "reason": None,
                "createdAt": published_at - timedelta(minutes=5),
            }
        )

        db.collection("publications").document(pub_id).set(
            {
                "articleId": article_id,
                "title": title,
                "summary": summary,
                "body": body,
                "imageUrl": _img(slug),
                "categoryIds": [slug],
                "sourceId": src["id"],
                "sourceName": src["name"],
                "originalUrl": url,
                "publishedBy": ADMIN_UID,
                "publishedAt": published_at,
                "createdAt": published_at,
                "status": "published",
                "portalPath": f"/noticias/{article_id}",
            }
        )

        db.collection("activityLogs").add(
            {
                "type": "publication",
                "action": "published",
                "userId": ADMIN_UID,
                "articleId": article_id,
                "publicationId": pub_id,
                "detail": f"Seed publicado: {title[:100]}",
                "createdAt": published_at,
            }
        )

        published_ids.append(article_id)
        batch_notes.append(f"published:{slug}")

    # ── Fila de revisão (3) ───────────────────────────────────
    for i in range(3):
        slug = CATEGORIES[i][0]
        label = CATEGORIES[i][1]
        title = f"Em revisão — {label} (fila {i + 1})"
        url = f"https://example.com/mock/review/{i + 1}"
        collected_id = f"cn-review-{i + 1}"
        article_id = f"art-review-{i + 1}"
        job_id = f"job-review-{i + 1}"
        ts = now - timedelta(minutes=30 - i)

        db.collection("collectedNews").document(collected_id).set(
            {
                "title": title,
                "summary": f"Coletada e preparada, aguardando aprovação ({label}).",
                "originalUrl": url,
                "imageUrl": _img(f"review-{i}"),
                "publishedAt": ts - timedelta(hours=1),
                "collectedAt": ts - timedelta(minutes=20),
                "sourceId": source_a["id"],
                "sourceName": source_a["name"],
                "categoryIds": [slug],
                "externalId": f"ext-review-{i}",
                "contentHash": _hash(url, title),
                "status": "collected",
                "rawExcerpt": "Texto bruto coletado para revisão.",
                "triggeredBy": ADMIN_UID,
                "processedByAi": True,
                "lastAiJobId": job_id,
                "lastArticleId": article_id,
                "aiProcessedAt": ts,
            }
        )
        db.collection("aiJobs").document(job_id).set(
            {
                "collectedNewsId": collected_id,
                "status": "succeeded",
                "error": None,
                "tokensUsage": None,
                "model": "passthrough",
                "promptVersion": "passthrough_v1",
                "triggeredBy": ADMIN_UID,
                "articleId": article_id,
                "createdAt": ts,
                "finishedAt": ts,
            }
        )
        db.collection("articles").document(article_id).set(
            {
                "collectedNewsId": collected_id,
                "sourceId": source_a["id"],
                "sourceName": source_a["name"],
                "originalUrl": url,
                "originalTitle": title,
                "originalSummary": f"Original em revisão {i + 1}",
                "imageUrl": _img(f"review-{i}"),
                "categoryIds": [slug],
                "adaptedTitle": title,
                "adaptedSummary": f"Versão adaptada aguardando revisão — {label}.",
                "adaptedBody": f"Corpo adaptado da matéria em revisão {i + 1} ({label}).",
                "insufficientInfo": False,
                "aiWarnings": [],
                "status": "review",
                "aiJobId": job_id,
                "model": "passthrough",
                "promptVersion": "passthrough_v1",
                "createdAt": ts,
                "updatedAt": ts,
                "reviewedAt": None,
                "reviewedBy": None,
                "rejectionReason": None,
                "publishedAt": None,
                "publishedBy": None,
            }
        )
        review_ids.append(article_id)

    # ── Aprovadas ainda não publicadas (2) ────────────────────
    for i in range(2):
        slug = CATEGORIES[4 + i][0]
        label = CATEGORIES[4 + i][1]
        title = f"Aprovada — {label}"
        url = f"https://example.com/mock/approved/{i + 1}"
        collected_id = f"cn-approved-{i + 1}"
        article_id = f"art-approved-{i + 1}"
        job_id = f"job-approved-{i + 1}"
        ts = now - timedelta(hours=5)

        db.collection("collectedNews").document(collected_id).set(
            {
                "title": title,
                "summary": f"Aprovada editorialmente ({label}).",
                "originalUrl": url,
                "imageUrl": _img(f"approved-{i}"),
                "publishedAt": ts,
                "collectedAt": ts,
                "sourceId": source_b["id"],
                "sourceName": source_b["name"],
                "categoryIds": [slug],
                "externalId": f"ext-approved-{i}",
                "contentHash": _hash(url, title),
                "status": "collected",
                "rawExcerpt": "Texto aprovado.",
                "triggeredBy": ADMIN_UID,
                "processedByAi": True,
                "lastAiJobId": job_id,
                "lastArticleId": article_id,
                "aiProcessedAt": ts,
            }
        )
        db.collection("articles").document(article_id).set(
            {
                "collectedNewsId": collected_id,
                "sourceId": source_b["id"],
                "sourceName": source_b["name"],
                "originalUrl": url,
                "originalTitle": title,
                "originalSummary": f"Original aprovada {i}",
                "imageUrl": _img(f"approved-{i}"),
                "categoryIds": [slug],
                "adaptedTitle": title,
                "adaptedSummary": f"Aprovada, pronta para publicar — {label}.",
                "adaptedBody": f"Corpo da matéria aprovada {i + 1}.",
                "insufficientInfo": False,
                "aiWarnings": [],
                "status": "approved",
                "aiJobId": job_id,
                "model": "passthrough",
                "promptVersion": "passthrough_v1",
                "createdAt": ts,
                "updatedAt": ts,
                "reviewedAt": ts,
                "reviewedBy": ADMIN_UID,
                "rejectionReason": None,
                "publishedAt": None,
                "publishedBy": None,
            }
        )
        db.collection("reviews").document(f"rev-approved-{i + 1}").set(
            {
                "articleId": article_id,
                "decision": "approved",
                "userId": ADMIN_UID,
                "reason": None,
                "createdAt": ts,
            }
        )

    # ── Rejeitadas (2) ────────────────────────────────────────
    for i in range(2):
        slug = CATEGORIES[8 + i][0]
        label = CATEGORIES[8 + i][1]
        title = f"Rejeitada — {label}"
        url = f"https://example.com/mock/rejected/{i + 1}"
        collected_id = f"cn-rejected-{i + 1}"
        article_id = f"art-rejected-{i + 1}"
        ts = now - timedelta(days=1)

        db.collection("collectedNews").document(collected_id).set(
            {
                "title": title,
                "summary": f"Rejeitada na revisão ({label}).",
                "originalUrl": url,
                "imageUrl": _img(f"rejected-{i}"),
                "publishedAt": ts,
                "collectedAt": ts,
                "sourceId": source_a["id"],
                "sourceName": source_a["name"],
                "categoryIds": [slug],
                "externalId": f"ext-rejected-{i}",
                "contentHash": _hash(url, title),
                "status": "collected",
                "rawExcerpt": "Texto rejeitado.",
                "triggeredBy": ADMIN_UID,
                "processedByAi": True,
                "lastArticleId": article_id,
            }
        )
        db.collection("articles").document(article_id).set(
            {
                "collectedNewsId": collected_id,
                "sourceId": source_a["id"],
                "sourceName": source_a["name"],
                "originalUrl": url,
                "originalTitle": title,
                "originalSummary": f"Original rejeitada {i}",
                "imageUrl": _img(f"rejected-{i}"),
                "categoryIds": [slug],
                "adaptedTitle": title,
                "adaptedSummary": f"Versão rejeitada — {label}.",
                "adaptedBody": "Corpo rejeitado por falta de checagem.",
                "insufficientInfo": True,
                "aiWarnings": ["Info insuficiente no original."],
                "status": "rejected",
                "aiJobId": f"job-rejected-{i + 1}",
                "model": "passthrough",
                "promptVersion": "passthrough_v1",
                "createdAt": ts,
                "updatedAt": ts,
                "reviewedAt": ts,
                "reviewedBy": ADMIN_UID,
                "rejectionReason": "Fatos incompletos / tom inadequado (seed).",
                "publishedAt": None,
                "publishedBy": None,
            }
        )
        db.collection("reviews").document(f"rev-rejected-{i + 1}").set(
            {
                "articleId": article_id,
                "decision": "rejected",
                "userId": ADMIN_UID,
                "reason": "Fatos incompletos / tom inadequado (seed).",
                "createdAt": ts,
            }
        )

    # ── Coletadas pendentes de preparação (4) + erro (1) ─────
    for i in range(4):
        slug = CATEGORIES[10 + (i % 6)][0]
        title = f"Coletada pendente #{i + 1}"
        url = f"https://example.com/mock/pending/{i + 1}"
        collected_id = f"cn-pending-{i + 1}"
        db.collection("collectedNews").document(collected_id).set(
            {
                "title": title,
                "summary": "Aguardando 'Preparar para revisão'.",
                "originalUrl": url,
                "imageUrl": _img(f"pending-{i}"),
                "publishedAt": now - timedelta(hours=i + 1),
                "collectedAt": now - timedelta(minutes=10 + i),
                "sourceId": source_b["id"],
                "sourceName": source_b["name"],
                "categoryIds": [slug],
                "externalId": f"ext-pending-{i}",
                "contentHash": _hash(url, title),
                "status": "collected",
                "rawExcerpt": "Texto bruto ainda não preparado.",
                "triggeredBy": ADMIN_UID,
                "processedByAi": False,
            }
        )
        collected_pending += 1

    db.collection("collectedNews").document("cn-error-1").set(
        {
            "title": "Falha de coleta / preparação (seed)",
            "summary": "Item com status error para validar badge e reprocessamento.",
            "originalUrl": "https://example.com/mock/error/1",
            "imageUrl": None,
            "publishedAt": now - timedelta(days=2),
            "collectedAt": now - timedelta(days=2),
            "sourceId": source_a["id"],
            "sourceName": source_a["name"],
            "categoryIds": ["geral"],
            "externalId": "ext-error-1",
            "contentHash": _hash("https://example.com/mock/error/1", "Falha"),
            "status": "error",
            "rawExcerpt": "",
            "triggeredBy": ADMIN_UID,
            "processedByAi": False,
        }
    )

    # Atualiza contadores das fontes
    total_for_a = len(
        [
            d
            for d in db.collection("collectedNews")
            .where("sourceId", "==", source_a["id"])
            .stream()
        ]
    )
    total_for_b = len(
        [
            d
            for d in db.collection("collectedNews")
            .where("sourceId", "==", source_b["id"])
            .stream()
        ]
    )
    db.collection("sources").document(source_a["id"]).update({"newsCount": total_for_a})
    db.collection("sources").document(source_b["id"]).update({"newsCount": total_for_b})

    db.collection("collectionRuns").document("seed-validation-run").set(
        {
            "runId": "seed-validation-run",
            "status": "succeeded",
            "triggeredBy": ADMIN_UID,
            "triggeredByEmail": ADMIN_EMAIL,
            "createdAt": now,
            "finishedAt": now,
            "totalFound": len(published_ids) + collected_pending + 8,
            "totalCreated": len(published_ids) + collected_pending + 8,
            "totalDuplicated": 0,
            "sourceCount": 2,
            "errors": [],
            "note": "Seed de validação estrutural",
        }
    )

    db.collection("activityLogs").add(
        {
            "type": "collect",
            "action": "seed_validation",
            "userId": ADMIN_UID,
            "detail": (
                f"Seed OK: {len(published_ids)} publicadas (1/categoria), "
                f"{len(review_ids)} em revisão, {collected_pending} pendentes."
            ),
            "createdAt": now,
        }
    )

    print("=== Seed validation flow ===")
    print(f"published articles (Home): {len(published_ids)}")
    print(f"review queue: {len(review_ids)}")
    print(f"pending collected: {collected_pending}")
    print("categories covered:", ", ".join(s for s, _ in CATEGORIES))


if __name__ == "__main__":
    seed()
