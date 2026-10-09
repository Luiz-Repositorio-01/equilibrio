import fs from "fs";
import path from "path";
import type { AdSlotConfig, Article, ArticleSummary, NewsletterLead, SiteMetrics } from "./types";
import { siteConfig } from "./site";
import { loadMetricsFromBlob, saveMetricsToBlob } from "./metrics-blob";
import { blobEnabled, blobListJson, blobReadJson, blobWriteJson, storeRpc } from "./blob-json";

const CONTENT_DIR = path.join(process.cwd(), "content");
const ARTICLES_DIR = path.join(CONTENT_DIR, "articles");
const INDEX_PATH = path.join(CONTENT_DIR, "index.json");
const LEADS_PATH = path.join(CONTENT_DIR, "data", "newsletter.json");
const METRICS_PATH = path.join(CONTENT_DIR, "data", "metrics.json");
const ADS_PATH = path.join(CONTENT_DIR, "data", "ads.json");

const BLOB_ARTICLE_PREFIX = "article:";
const BLOB_ADS = "ads";
const CACHE_TTL_MS = 15_000;

function ensureDirs() {
  try {
    fs.mkdirSync(path.join(CONTENT_DIR, "data"), { recursive: true });
    fs.mkdirSync(ARTICLES_DIR, { recursive: true });
  } catch {
    // filesystem somente leitura (Vercel) — diretórios já vêm empacotados no deploy
  }
}

function readJson<T>(filePath: string, fallback: T): T {
  ensureDirs();
  if (!fs.existsSync(filePath)) return fallback;
  const raw = fs.readFileSync(filePath, "utf-8").replace(/^﻿/, "");
  return JSON.parse(raw) as T;
}

/** Retorna false quando o disco é somente leitura (Vercel); persistência real vai pelo Blob. */
function writeJson(filePath: string, data: unknown): boolean {
  try {
    ensureDirs();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch {
    return false;
  }
}

/** Data de hoje no fuso de Brasília (YYYY-MM-DD). */
export function todayBR() {
  return new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10);
}

/** datetime-local (sem fuso) é horário de Brasília; ISO com fuso é mantido. */
export function normalizeScheduledFor(value?: string): string | undefined {
  const v = (value || "").trim();
  if (!v) return undefined;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return `${v}:00-03:00`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return `${v}T00:00:00-03:00`;
  return v;
}

function toSummary(article: Article): ArticleSummary {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    subtitle: article.subtitle,
    excerpt: article.excerpt,
    author: article.author,
    category: article.category,
    categorySlug: article.categorySlug,
    tags: article.tags,
    coverImage: article.coverImage,
    coverAlt: article.coverAlt,
    coverCaption: article.coverCaption,
    coverDescription: article.coverDescription,
    coverVariants: article.coverVariants,
    coverMeta: article.coverMeta,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    readingTime: article.readingTime,
    featured: article.featured,
    status: article.status,
    views: article.views,
    likes: article.likes,
    seo: article.seo,
    scheduledFor: article.scheduledFor,
    audioUrl: article.audioUrl,
    goldTip: article.goldTip,
  };
}

type StoredArticle = Article & { deleted?: boolean };

let articlesCache: { at: number; items: Article[] } | null = null;

export function invalidateArticleCache() {
  articlesCache = null;
}

function readFsArticles(): Article[] {
  ensureDirs();
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  const out: Article[] = [];
  for (const f of fs.readdirSync(ARTICLES_DIR)) {
    if (!f.endsWith(".json")) continue;
    try {
      out.push(readJson<Article>(path.join(ARTICLES_DIR, f), null as unknown as Article));
    } catch (err) {
      console.error(`[cms] artigo ilegível: ${f}`, err);
    }
  }
  return out.filter(Boolean);
}

/**
 * Todos os artigos (brutos, qualquer status): arquivos do repositório
 * + camada do Blob (artigos novos/editados pelo admin em produção).
 * O Blob sempre prevalece sobre o arquivo empacotado no deploy.
 */
export async function loadAllArticles(opts?: { fresh?: boolean }): Promise<Article[]> {
  if (!opts?.fresh && articlesCache && Date.now() - articlesCache.at < CACHE_TTL_MS) {
    return articlesCache.items;
  }

  const bySlug = new Map<string, Article>();
  for (const a of readFsArticles()) bySlug.set(a.slug, a);

  for (const a of await blobListJson<StoredArticle>(BLOB_ARTICLE_PREFIX)) {
    if (!a?.slug) continue;
    if (a.deleted) bySlug.delete(a.slug);
    else bySlug.set(a.slug, a);
  }

  const views = (await getViewTotals()).bySlug;
  // "views" do JSON do repositório eram números de exemplo: só a contagem real vale.
  const items = [...bySlug.values()]
    .map((a) => ({ ...a, views: views[a.slug] || 0 }))
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
  articlesCache = { at: Date.now(), items };
  return items;
}

/** Mantém content/index.json em dia quando o disco é gravável (dev local). */
function rebuildIndex() {
  const summaries = readFsArticles().map(toSummary);
  summaries.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
  writeJson(INDEX_PATH, summaries);
}

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export async function listArticlesAdmin(): Promise<ArticleSummary[]> {
  return (await loadAllArticles({ fresh: true })).map(toSummary);
}

export async function getArticleAdmin(slug: string): Promise<Article | null> {
  return (await loadAllArticles({ fresh: true })).find((a) => a.slug === slug) || null;
}

export async function saveArticle(input: Partial<Article> & { title: string; content: string }) {
  ensureDirs();
  const now = todayBR();
  const slug = input.slug || slugify(input.title);
  const existing = await getArticleAdmin(slug);

  const status = (input.status || "published") as Article["status"];
  const scheduledFor =
    status === "scheduled" ? normalizeScheduledFor(input.scheduledFor) : undefined;
  if (status === "scheduled" && (!scheduledFor || Number.isNaN(+new Date(scheduledFor)))) {
    throw new Error("Informe a data e a hora do agendamento.");
  }

  let publishedAt = input.publishedAt || existing?.publishedAt || now;
  if (status === "scheduled") publishedAt = scheduledFor!.slice(0, 10);
  else if (status === "published" && publishedAt > now) publishedAt = now;

  const article: Article = {
    id: existing?.id || `art-${Date.now()}`,
    slug,
    title: input.title,
    subtitle: input.subtitle || "",
    excerpt: input.excerpt || input.content.replace(/<[^>]+>/g, "").slice(0, 220),
    content: input.content,
    contentText: input.contentText || input.content.replace(/<[^>]+>/g, " "),
    author: input.author || siteConfig.author,
    category: input.category || "Saúde da Mente",
    categorySlug: input.categorySlug || slugify(input.category || "saude-da-mente"),
    tags: input.tags || ["bem-estar"],
    coverImage:
      input.coverImage ||
      existing?.coverImage ||
      `/images/covers/${input.categorySlug || "saude-da-mente"}.svg`,
    coverAlt: input.coverAlt || existing?.coverAlt || `Ilustração do artigo: ${input.title}`,
    coverCaption: input.coverCaption ?? existing?.coverCaption,
    coverDescription: input.coverDescription ?? existing?.coverDescription,
    coverVariants: input.coverVariants ?? existing?.coverVariants,
    coverMeta: input.coverMeta ?? existing?.coverMeta,
    publishedAt,
    updatedAt: now,
    readingTime:
      input.readingTime ||
      Math.max(1, Math.round((input.content.replace(/<[^>]+>/g, " ").split(/\s+/).length || 200) / 200)),
    featured: Boolean(input.featured),
    status,
    views: existing?.views || 0,
    likes: existing?.likes || 0,
    seo: input.seo ||
      existing?.seo || {
        title: input.title,
        description: (input.excerpt || input.content.replace(/<[^>]+>/g, "")).slice(0, 160),
        keywords: input.tags || ["bem-estar"],
      },
    toc: input.toc || [],
    faq: input.faq || [],
    scheduledFor,
    audioUrl: input.audioUrl || existing?.audioUrl || "",
    goldTip: input.goldTip || existing?.goldTip || "",
    sourceFile: existing?.sourceFile,
  };

  // Auto TOC from h2
  if (!article.toc.length) {
    const matches = [...article.content.matchAll(/<h2[^>]*id="([^"]+)"[^>]*>(.*?)<\/h2>/gi)];
    article.toc = matches.map((m) => ({
      id: m[1],
      title: m[2].replace(/<[^>]+>/g, ""),
    }));
  }

  const savedToDisk = writeJson(path.join(ARTICLES_DIR, `${slug}.json`), article);
  if (savedToDisk) rebuildIndex();
  if (blobEnabled()) {
    await blobWriteJson(`${BLOB_ARTICLE_PREFIX}${slug}`, article);
  } else if (!savedToDisk) {
    throw new Error(
      "Não foi possível salvar: armazenamento indisponível (configure BLOB_READ_WRITE_TOKEN na Vercel)."
    );
  }
  invalidateArticleCache();
  return article;
}

export async function deleteArticle(slug: string) {
  const filePath = path.join(ARTICLES_DIR, `${slug}.json`);
  let removedFromDisk = false;
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      removedFromDisk = true;
    }
  } catch {
    // filesystem somente leitura
  }
  if (removedFromDisk) rebuildIndex();
  if (blobEnabled()) {
    // "tombstone": esconde também o arquivo que veio empacotado no deploy
    await blobWriteJson(`${BLOB_ARTICLE_PREFIX}${slug}`, {
      slug,
      deleted: true,
      deletedAt: new Date().toISOString(),
    });
  } else if (!removedFromDisk && fs.existsSync(filePath)) {
    throw new Error("Não foi possível excluir: armazenamento indisponível.");
  }
  invalidateArticleCache();
}

export function addNewsletterLead(email: string, source = "site") {
  const leads = readJson<NewsletterLead[]>(LEADS_PATH, []);
  if (leads.some((l) => l.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false as const, reason: "already_subscribed" as const };
  }
  const lead: NewsletterLead = {
    id: `lead-${Date.now()}`,
    email,
    createdAt: new Date().toISOString(),
    source,
  };
  leads.unshift(lead);
  writeJson(LEADS_PATH, leads);
  return { ok: true as const, lead };
}

export function getNewsletterLeads() {
  return readJson<NewsletterLead[]>(LEADS_PATH, []);
}

export function getDefaultAdSlots(): AdSlotConfig[] {
  return [
    { id: "home-top", label: "Home — Topo", position: "home-top", enabled: true, provider: "adsense" },
    { id: "article-incontent-1", label: "Artigo — Após introdução", position: "article-mid-1", enabled: true, provider: "adsense" },
    { id: "article-sidebar", label: "Artigo — Lateral", position: "article-sidebar", enabled: true, provider: "adsense" },
    { id: "article-end", label: "Artigo — Final", position: "article-end", enabled: true, provider: "adsense" },
    { id: "home-feed", label: "Home — Meio do feed", position: "home-feed", enabled: true, provider: "adsense" },
    { id: "sponsor-banner", label: "Banner Patrocinado", position: "sponsor", enabled: true, provider: "custom" },
    { id: "affiliate-box", label: "Bloco Afiliados", position: "affiliate", enabled: true, provider: "custom" },
    { id: "related-native", label: "Recomendados (Taboola/Outbrain)", position: "native", enabled: false, provider: "taboola" },
  ];
}

let adsCache: { at: number; data: AdSlotConfig[] } | null = null;

export async function getAdSlots(): Promise<AdSlotConfig[]> {
  if (adsCache && Date.now() - adsCache.at < CACHE_TTL_MS) return adsCache.data;
  const remote = await blobReadJson<AdSlotConfig[]>(BLOB_ADS);
  const data =
    Array.isArray(remote) && remote.length
      ? remote
      : readJson<AdSlotConfig[]>(ADS_PATH, getDefaultAdSlots());
  adsCache = { at: Date.now(), data };
  return data;
}

export async function saveAdSlots(slots: AdSlotConfig[]) {
  const savedToDisk = writeJson(ADS_PATH, slots);
  if (blobEnabled()) await blobWriteJson(BLOB_ADS, slots);
  else if (!savedToDisk) throw new Error("Não foi possível salvar: armazenamento indisponível.");
  adsCache = { at: Date.now(), data: slots };
  return slots;
}

type RealMetricsState = {
  pageViews: number;
  uniqueVisitors: number;
  newsletterSignups: number;
  avgScroll: number;
  avgReadingTime: number;
  events: Record<string, number>;
  /** Real per-article view counts (slug -> count), tracked from actual visits. */
  articleViews: Record<string, number>;
};

function defaultRealMetrics(): RealMetricsState {
  return {
    pageViews: 0,
    uniqueVisitors: 0,
    newsletterSignups: 0,
    avgScroll: 42,
    avgReadingTime: 3.5,
    events: {},
    articleViews: {},
  };
}

/** In-memory cache so repeated calls within the same server instance don't re-fetch Blob. */
let realMetricsCache: RealMetricsState | null = null;
let realMetricsBlobHydrated = false;

async function hydrateRealMetrics(): Promise<RealMetricsState> {
  if (realMetricsCache) return realMetricsCache;
  const disk = readJson<Partial<RealMetricsState>>(METRICS_PATH, {});
  realMetricsCache = { ...defaultRealMetrics(), ...disk, articleViews: disk.articleViews || {} };

  if (!realMetricsBlobHydrated) {
    realMetricsBlobHydrated = true;
    const remote = await loadMetricsFromBlob<RealMetricsState>();
    if (remote) {
      realMetricsCache = { ...defaultRealMetrics(), ...remote };
    }
  }
  return realMetricsCache;
}

let lastMetricsBlobSave = 0;
const METRICS_BLOB_EVERY_MS = 5 * 60_000;

async function persistRealMetrics(data: RealMetricsState) {
  realMetricsCache = data;
  writeJson(METRICS_PATH, data);
  // Gravar no Blob a cada visita estoura a cota de operações do plano (e suspende o store).
  if (Date.now() - lastMetricsBlobSave < METRICS_BLOB_EVERY_MS) return;
  lastMetricsBlobSave = Date.now();
  await saveMetricsToBlob(data);
}

/** Contagem real de visualizações (por artigo e do site), com cache curto em memória. */
let viewsCache: { at: number; site: number; bySlug: Record<string, number> } | null = null;
const VIEWS_TTL_MS = 60_000;

export async function getViewTotals(
  opts?: { fresh?: boolean }
): Promise<{ site: number; bySlug: Record<string, number> }> {
  if (!blobEnabled()) {
    const m = await hydrateRealMetrics();
    return { site: m.pageViews, bySlug: m.articleViews };
  }
  if (!opts?.fresh && viewsCache && Date.now() - viewsCache.at < VIEWS_TTL_MS) return viewsCache;
  try {
    const rows = (await storeRpc<{ slug: string; total: number }[]>("blog_view_totals")) || [];
    const bySlug: Record<string, number> = {};
    let site = 0;
    for (const r of rows) {
      if (r.slug === "_site") site = Number(r.total);
      else bySlug[r.slug] = Number(r.total);
    }
    viewsCache = { at: Date.now(), site, bySlug };
  } catch (err) {
    console.warn("[views] leitura falhou:", err instanceof Error ? err.message : err);
    return viewsCache ?? { site: 0, bySlug: {} };
  }
  return viewsCache;
}

/** Registra 1 visualização (contador atômico no Supabase; em dev, arquivo local). */
export async function recordPageView(slug?: string) {
  if (blobEnabled()) {
    await storeRpc("blog_track_view", { p_slug: "_site" });
    if (slug) await storeRpc("blog_track_view", { p_slug: slug });
    return;
  }
  const m = await hydrateRealMetrics();
  m.pageViews += 1;
  if (slug) m.articleViews[slug] = (m.articleViews[slug] || 0) + 1;
  await persistRealMetrics(m);
}

export async function trackMetricEvent(name: string, meta?: { path?: string; slug?: string }) {
  // Visualização de página tem contador próprio (atômico, não perde visitas).
  if (name === "page_view") {
    await recordPageView(meta?.slug);
    return;
  }
  const metrics = await hydrateRealMetrics();

  metrics.events[name] = (metrics.events[name] || 0) + 1;
  if (name === "newsletter_signup") metrics.newsletterSignups += 1;

  await persistRealMetrics(metrics);
  return metrics;
}

export async function getMetrics(): Promise<SiteMetrics> {
  const metrics = await hydrateRealMetrics();
  const totals = await getViewTotals({ fresh: true }); // painel do admin: sempre atualizado

  const publishedBySlug = new Map(
    (await listArticlesAdmin())
      .filter((a) => a.status === "published")
      .map((a) => [a.slug, a.title])
  );

  const topArticles = Object.entries(totals.bySlug)
    .filter(([slug]) => publishedBySlug.has(slug))
    .map(([slug, views]) => ({ slug, title: publishedBySlug.get(slug)!, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);

  return {
    pageViews: totals.site,
    // Visitantes únicos não são medidos (antes era uma estimativa inventada: 62% das views).
    uniqueVisitors: 0,
    newsletterSignups: metrics.newsletterSignups,
    avgScroll: metrics.avgScroll,
    avgReadingTime: metrics.avgReadingTime,
    events: metrics.events,
    topArticles,
  };
}
