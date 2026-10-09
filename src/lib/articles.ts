import type { Article, ArticleSummary } from "./types";
import { loadAllArticles } from "./cms";

/**
 * Status "efetivo" para o site público: artigo agendado cuja data/hora já
 * passou conta como publicado (não depende de cron nem de novo deploy).
 */
function applySchedule(a: Article, now = Date.now()): Article {
  if (a.status !== "scheduled" || !a.scheduledFor) return a;
  const when = +new Date(a.scheduledFor);
  if (Number.isNaN(when) || when > now) return a;
  return { ...a, status: "published", publishedAt: a.scheduledFor.slice(0, 10) };
}

function toSummary(a: Article): ArticleSummary {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { content, contentText, toc, faq, sourceFile, ...summary } = a;
  return summary;
}

// Mais recente primeiro; no mesmo dia, o cadastrado depois (id maior) vem antes.
const byDateDesc = (a: ArticleSummary, b: ArticleSummary) =>
  +new Date(b.publishedAt) - +new Date(a.publishedAt) ||
  b.id.localeCompare(a.id, undefined, { numeric: true });

async function allEffective(): Promise<Article[]> {
  const now = Date.now();
  return (await loadAllArticles()).map((a) => applySchedule(a, now));
}

function enhanceContent(html: string): string {
  // Convert "Dica de Ouro" paragraphs into premium callout blocks
  return html
    .replace(
      /<p>(?:🌟\s*)?A Dica de Ouro<\/p>\s*<p>([\s\S]*?)<\/p>/gi,
      (_m, body: string) =>
        `<aside class="callout callout--gold"><h3 class="callout__title">A Dica de Ouro</h3><p>${body}</p></aside>`
    )
    .replace(
      /<p>(?:🌟\s*)?A Dica de Ouro<\/p>/gi,
      `<aside class="callout callout--gold"><h3 class="callout__title">A Dica de Ouro</h3>`
    );
}

/** Extrai texto da Dica de Ouro para a lateral do artigo */
export function extractGoldTip(html: string, explicit?: string): string | null {
  if (explicit?.trim()) return explicit.trim();
  const fromCallout = html.match(
    /<aside class="callout callout--gold">[\s\S]*?<p>([\s\S]*?)<\/p>/i
  );
  if (fromCallout?.[1]) {
    return fromCallout[1].replace(/<[^>]+>/g, "").trim().slice(0, 280);
  }
  const fromParagraphs = html.match(
    /<p>(?:🌟\s*)?A Dica de Ouro<\/p>\s*<p>([\s\S]*?)<\/p>/i
  );
  if (fromParagraphs?.[1]) {
    return fromParagraphs[1].replace(/<[^>]+>/g, "").trim().slice(0, 280);
  }
  return null;
}

export async function getArticleSummaries(): Promise<ArticleSummary[]> {
  return (await allEffective())
    .filter((a) => a.status === "published")
    .map(toSummary)
    .sort(byDateDesc);
}

export async function getAllArticleSummaries(): Promise<ArticleSummary[]> {
  return (await allEffective()).map(toSummary).sort(byDateDesc);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const article = (await allEffective()).find((a) => a.slug === slug);
  if (!article) return null;
  return {
    ...article,
    content: enhanceContent(article.content),
  };
}

/** Slugs publicados para pré-geração; artigos novos são gerados sob demanda. */
export async function getAllSlugs(): Promise<string[]> {
  return (await loadAllArticles()).map((a) => a.slug);
}

export async function getFeaturedArticle(): Promise<ArticleSummary | null> {
  // O destaque da home é sempre o artigo publicado mais recente.
  return (await getArticleSummaries())[0] || null;
}

export async function getPopularArticles(limit = 6): Promise<ArticleSummary[]> {
  return [...(await getArticleSummaries())]
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

export async function getRecentArticles(limit = 9): Promise<ArticleSummary[]> {
  return (await getArticleSummaries()).slice(0, limit);
}

export async function getArticlesByCategory(categorySlug: string): Promise<ArticleSummary[]> {
  return (await getArticleSummaries()).filter((a) => a.categorySlug === categorySlug);
}

export async function getArticlesByTag(tag: string): Promise<ArticleSummary[]> {
  const normalized = tag.toLowerCase();
  return (await getArticleSummaries()).filter((a) =>
    a.tags.map((t) => t.toLowerCase()).includes(normalized)
  );
}

export async function getRelatedArticles(article: Article, limit = 4): Promise<ArticleSummary[]> {
  const others = (await getArticleSummaries()).filter((a) => a.slug !== article.slug);
  const scored = others.map((a) => {
    let score = 0;
    if (a.categorySlug === article.categorySlug) score += 5;
    score += a.tags.filter((t) => article.tags.includes(t)).length * 2;
    return { a, score };
  });
  return scored
    .sort((x, y) => y.score - x.score || y.a.views - x.a.views)
    .slice(0, limit)
    .map((x) => x.a);
}

export async function getAdjacentArticles(slug: string): Promise<{
  prev: ArticleSummary | null;
  next: ArticleSummary | null;
}> {
  const all = await getArticleSummaries();
  const idx = all.findIndex((a) => a.slug === slug);
  if (idx < 0) return { prev: null, next: null };
  return {
    prev: all[idx + 1] || null,
    next: all[idx - 1] || null,
  };
}

export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const map = new Map<string, number>();
  for (const a of await getArticleSummaries()) {
    for (const tag of a.tags) {
      map.set(tag, (map.get(tag) || 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getAllCategories(): Promise<{ name: string; slug: string; count: number }[]> {
  const map = new Map<string, { name: string; count: number }>();
  for (const a of await getArticleSummaries()) {
    const prev = map.get(a.categorySlug);
    map.set(a.categorySlug, {
      name: a.category,
      count: (prev?.count || 0) + 1,
    });
  }
  return [...map.entries()].map(([slug, v]) => ({
    slug,
    name: v.name,
    count: v.count,
  }));
}

export async function searchArticles(query: string): Promise<ArticleSummary[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  const fullBySlug = new Map((await allEffective()).map((a) => [a.slug, a]));

  return (await getArticleSummaries())
    .map((a) => {
      const hay = [
        a.title,
        a.subtitle,
        a.excerpt,
        a.category,
        a.tags.join(" "),
        a.author,
      ]
        .join(" ")
        .toLowerCase();

      // Also search full content when available
      const contentHay = (fullBySlug.get(a.slug)?.contentText || "").toLowerCase();
      const blob = `${hay} ${contentHay}`;

      let score = 0;
      for (const term of terms) {
        if (a.title.toLowerCase().includes(term)) score += 10;
        if (a.tags.some((t) => t.toLowerCase().includes(term))) score += 6;
        if (a.category.toLowerCase().includes(term)) score += 5;
        if (blob.includes(term)) score += 2;
      }
      return { a, score };
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score)
    .map((x) => x.a);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

/** Returns a displayable author name, or null when empty/placeholder. */
export function resolveAuthor(author?: string): string | null {
  const a = (author || "").trim();
  if (!a) return null;
  if (/^\[.*\]$/.test(a)) return null;
  return a;
}
