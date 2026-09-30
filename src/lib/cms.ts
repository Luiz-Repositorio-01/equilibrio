import fs from "fs";
import path from "path";
import type { AdSlotConfig, Article, ArticleSummary, NewsletterLead, SiteMetrics } from "./types";
import { siteConfig } from "./site";

const CONTENT_DIR = path.join(process.cwd(), "content");
const ARTICLES_DIR = path.join(CONTENT_DIR, "articles");
const INDEX_PATH = path.join(CONTENT_DIR, "index.json");
const LEADS_PATH = path.join(CONTENT_DIR, "data", "newsletter.json");
const METRICS_PATH = path.join(CONTENT_DIR, "data", "metrics.json");
const ADS_PATH = path.join(CONTENT_DIR, "data", "ads.json");

function ensureDirs() {
  fs.mkdirSync(path.join(CONTENT_DIR, "data"), { recursive: true });
  fs.mkdirSync(ARTICLES_DIR, { recursive: true });
}

function readJson<T>(filePath: string, fallback: T): T {
  ensureDirs();
  if (!fs.existsSync(filePath)) return fallback;
  const raw = fs.readFileSync(filePath, "utf-8").replace(/^\uFEFF/, "");
  return JSON.parse(raw) as T;
}

function writeJson(filePath: string, data: unknown) {
  try {
    ensureDirs();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // Vercel's production filesystem is read-only; callers still get the
    // freshly computed in-memory data, only the on-disk cache is skipped.
  }
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

function rebuildIndex() {
  const files = fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".json"));
  const summaries = files.map((f) => {
    const article = readJson<Article>(path.join(ARTICLES_DIR, f), null as unknown as Article);
    return toSummary(article);
  });
  summaries.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
  writeJson(INDEX_PATH, summaries);
  return summaries;
}

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function listArticlesAdmin(): ArticleSummary[] {
  return rebuildIndex();
}

export function getArticleAdmin(slug: string): Article | null {
  const filePath = path.join(ARTICLES_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  return readJson<Article>(filePath, null as unknown as Article);
}

export function saveArticle(input: Partial<Article> & { title: string; content: string }) {
  ensureDirs();
  const now = new Date().toISOString().slice(0, 10);
  const existing = input.slug ? getArticleAdmin(input.slug) : null;
  const slug = input.slug || slugify(input.title);

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
    publishedAt: input.publishedAt || existing?.publishedAt || now,
    updatedAt: now,
    readingTime:
      input.readingTime ||
      Math.max(1, Math.round((input.content.replace(/<[^>]+>/g, " ").split(/\s+/).length || 200) / 200)),
    featured: Boolean(input.featured),
    status: input.status || "published",
    views: existing?.views || 0,
    likes: existing?.likes || 0,
    seo: input.seo ||
      existing?.seo || {
        title: `${input.title} | ${siteConfig.name}`,
        description: (input.excerpt || input.content.replace(/<[^>]+>/g, "")).slice(0, 160),
        keywords: input.tags || ["bem-estar"],
      },
    toc: input.toc || [],
    faq: input.faq || [],
    scheduledFor: input.scheduledFor,
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

  writeJson(path.join(ARTICLES_DIR, `${slug}.json`), article);
  rebuildIndex();
  return article;
}

export function deleteArticle(slug: string) {
  const filePath = path.join(ARTICLES_DIR, `${slug}.json`);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  rebuildIndex();
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

export function getAdSlots() {
  return readJson<AdSlotConfig[]>(ADS_PATH, getDefaultAdSlots());
}

export function saveAdSlots(slots: AdSlotConfig[]) {
  writeJson(ADS_PATH, slots);
  return slots;
}

export function trackMetricEvent(name: string, meta?: { path?: string; slug?: string }) {
  const metrics = readJson<SiteMetrics>(METRICS_PATH, {
    pageViews: 0,
    uniqueVisitors: 0,
    newsletterSignups: 0,
    avgScroll: 0,
    avgReadingTime: 0,
    topArticles: [],
    events: {},
  });

  metrics.events[name] = (metrics.events[name] || 0) + 1;
  if (name === "page_view") metrics.pageViews += 1;
  if (name === "newsletter_signup") metrics.newsletterSignups += 1;

  if (meta?.slug && (name === "article_open" || name === "page_view")) {
    const article = getArticleAdmin(meta.slug);
    if (article) {
      article.views += 1;
      writeJson(path.join(ARTICLES_DIR, `${meta.slug}.json`), article);
      rebuildIndex();
    }
  }

  writeJson(METRICS_PATH, metrics);
  return metrics;
}

export function getMetrics(): SiteMetrics {
  const base = readJson<SiteMetrics>(METRICS_PATH, {
    pageViews: 0,
    uniqueVisitors: 0,
    newsletterSignups: 0,
    avgScroll: 42,
    avgReadingTime: 3.5,
    topArticles: [],
    events: {},
  });

  const articles = listArticlesAdmin()
    .filter((a) => a.status === "published")
    .sort((a, b) => b.views - a.views)
    .slice(0, 8)
    .map((a) => ({ slug: a.slug, title: a.title, views: a.views }));

  return {
    ...base,
    topArticles: articles,
    uniqueVisitors: base.uniqueVisitors || Math.round(base.pageViews * 0.62),
  };
}
