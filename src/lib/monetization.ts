import fs from "fs";
import path from "path";
import type {
  AdManagerConfig,
  AdNetworkConfig,
  AdSenseConfig,
  AffiliateAccount,
  BannerConfig,
  BankingInfo,
  MonetizationState,
  RevenueEntry,
  SetupStepId,
  SetupWizardState,
} from "./types";
import { getAdSlots, getMetrics, getNewsletterLeads, listArticlesAdmin } from "./cms";
import { analyticsConfig } from "./site";

const DATA_PATH = path.join(process.cwd(), "content", "data", "monetization.json");

const DEFAULT_ADSENSE: AdSenseConfig = {
  publisherId: "",
  clientId: "",
  script: "",
  status: "nao_configurado",
  scriptInstalled: false,
};

const DEFAULT_AD_MANAGER: AdManagerConfig = {
  networkId: "",
  tags: [],
  blocks: [],
};

const DEFAULT_NETWORKS: AdNetworkConfig[] = [
  { id: "ezoic", provider: "ezoic", accountId: "", status: "nao_configurado" },
  { id: "mediavine", provider: "mediavine", accountId: "", status: "nao_configurado" },
  { id: "raptive", provider: "raptive", accountId: "", status: "nao_configurado" },
  { id: "monetag", provider: "monetag", accountId: "", status: "nao_configurado" },
  { id: "propellerads", provider: "propellerads", accountId: "", status: "nao_configurado" },
  { id: "taboola", provider: "taboola", accountId: "", status: "nao_configurado" },
  { id: "outbrain", provider: "outbrain", accountId: "", status: "nao_configurado" },
];

const DEFAULT_BANKING: BankingInfo = {
  holderName: "",
  document: "",
  bank: "",
  agency: "",
  account: "",
  pixKey: "",
};

const DEFAULT_SETUP: SetupWizardState = {
  completed: false,
  steps: {
    ga4: false,
    gsc: false,
    gtm: false,
    adsense: false,
    ad_slots: false,
    affiliates: false,
    newsletter: false,
    seo: false,
    indexing: false,
    first_article: false,
  },
};

function ensureDir() {
  fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
}

function readJson<T>(fallback: T): T {
  ensureDir();
  if (!fs.existsSync(DATA_PATH)) return fallback;
  const raw = fs.readFileSync(DATA_PATH, "utf-8").replace(/^\uFEFF/, "");
  return { ...fallback, ...JSON.parse(raw) } as T;
}

function writeJson(data: MonetizationState) {
  try {
    ensureDir();
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // Vercel's production filesystem is read-only; the in-memory state
    // returned to the caller still reflects the save, only the on-disk
    // copy is skipped.
  }
}

export function getDefaultMonetization(): MonetizationState {
  return {
    adsense: { ...DEFAULT_ADSENSE },
    adManager: { ...DEFAULT_AD_MANAGER, blocks: [] },
    affiliates: [],
    networks: DEFAULT_NETWORKS.map((n) => ({ ...n })),
    banners: [],
    banking: { ...DEFAULT_BANKING },
    revenue: [],
    setup: {
      completed: false,
      steps: { ...DEFAULT_SETUP.steps },
    },
  };
}

export function getMonetization(): MonetizationState {
  const base = getDefaultMonetization();
  const stored = readJson<Partial<MonetizationState>>(base);
  return {
    adsense: { ...base.adsense, ...stored.adsense },
    adManager: {
      ...base.adManager,
      ...stored.adManager,
      blocks: stored.adManager?.blocks || [],
      tags: stored.adManager?.tags || [],
    },
    affiliates: stored.affiliates || [],
    networks: mergeNetworks(stored.networks),
    banners: stored.banners || [],
    banking: { ...base.banking, ...stored.banking },
    revenue: stored.revenue || [],
    setup: {
      completed: Boolean(stored.setup?.completed),
      steps: { ...base.setup.steps, ...stored.setup?.steps },
      dismissedAt: stored.setup?.dismissedAt,
      completedAt: stored.setup?.completedAt,
    },
  };
}

function mergeNetworks(stored?: AdNetworkConfig[]) {
  const map = new Map((stored || []).map((n) => [n.provider, n]));
  return DEFAULT_NETWORKS.map((def) => ({ ...def, ...map.get(def.provider) }));
}

export function saveMonetization(state: MonetizationState) {
  writeJson(state);
  return state;
}

export function updateMonetization(patch: Partial<MonetizationState>) {
  const current = getMonetization();
  const next = { ...current, ...patch };
  return saveMonetization(next);
}

export function detectAdSenseInstall(config: AdSenseConfig) {
  const client = (config.clientId || analyticsConfig.adsenseClient || "").trim();
  const script = (config.script || "").trim();
  const publisher = (config.publisherId || "").trim();

  const hasClient = /^ca-pub-\d{10,20}$/i.test(client) || /pub-\d{10,20}/i.test(client);
  const hasPublisher = /pub-\d{10,20}/i.test(publisher) || hasClient;
  const hasScript =
    script.includes("pagead2.googlesyndication.com") ||
    script.includes("adsbygoogle") ||
    Boolean(analyticsConfig.adsenseClient);

  const scriptInstalled = hasClient && (hasScript || Boolean(analyticsConfig.adsenseClient));

  let status = config.status;
  if (!hasPublisher && !hasClient) status = "nao_configurado";
  else if (scriptInstalled && (status === "nao_configurado" || status === "em_analise")) {
    // keep manual override for aprovado/ativo
    if (status === "nao_configurado") status = "em_analise";
  }

  return {
    scriptInstalled,
    hasClient,
    hasPublisher,
    hasScript,
    status,
    message: scriptInstalled
      ? "Script detectado. Confirme o status no painel do AdSense."
      : "Insira o Client ID (ca-pub-...) e o script para verificação.",
  };
}

export function saveAdSense(input: Partial<AdSenseConfig>) {
  const state = getMonetization();
  const adsense = { ...state.adsense, ...input };
  const check = detectAdSenseInstall(adsense);
  adsense.scriptInstalled = check.scriptInstalled;
  adsense.lastCheckedAt = new Date().toISOString();
  if (input.status) adsense.status = input.status;
  else adsense.status = check.status;
  state.adsense = adsense;
  if (adsense.scriptInstalled) {
    state.setup.steps.adsense = true;
  }
  return saveMonetization(state);
}

export function saveAdManager(input: Partial<AdManagerConfig>) {
  const state = getMonetization();
  state.adManager = {
    ...state.adManager,
    ...input,
    tags: input.tags ?? state.adManager.tags,
    blocks: input.blocks ?? state.adManager.blocks,
  };
  return saveMonetization(state);
}

export function saveAffiliates(affiliates: AffiliateAccount[]) {
  const state = getMonetization();
  state.affiliates = affiliates;
  if (affiliates.some((a) => a.active)) state.setup.steps.affiliates = true;
  return saveMonetization(state);
}

export function saveNetworks(networks: AdNetworkConfig[]) {
  const state = getMonetization();
  state.networks = networks;
  return saveMonetization(state);
}

export function saveBanners(banners: BannerConfig[]) {
  const state = getMonetization();
  state.banners = banners;
  return saveMonetization(state);
}

export function saveBanking(banking: BankingInfo) {
  const state = getMonetization();
  state.banking = { ...banking, updatedAt: new Date().toISOString() };
  return saveMonetization(state);
}

export function addRevenueEntry(entry: Omit<RevenueEntry, "id" | "createdAt">) {
  const state = getMonetization();
  const full: RevenueEntry = {
    ...entry,
    id: `rev-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  state.revenue.unshift(full);
  return saveMonetization(state);
}

export function deleteRevenueEntry(id: string) {
  const state = getMonetization();
  state.revenue = state.revenue.filter((r) => r.id !== id);
  return saveMonetization(state);
}

type RevenueImportRow = {
  date: string;
  source: RevenueEntry["source"];
  amount: number;
  currency?: "BRL" | "USD";
  impressions?: number;
  clicks?: number;
  conversions?: number;
  articleSlug?: string;
  categorySlug?: string;
  notes?: string;
  origin?: string;
};

/** Bulk import (JSON export from platforms or spreadsheet → JSON). Marks as API when flagged. */
export function importRevenueEntries(
  rows: RevenueImportRow[],
  options: { fromApi?: boolean } = {}
) {
  const state = getMonetization();
  const now = Date.now();
  const imported: RevenueEntry[] = rows
    .filter((r) => r.date && r.source && Number.isFinite(Number(r.amount)))
    .map((r, i) => ({
      id: `rev-imp-${now}-${i}`,
      date: String(r.date).slice(0, 10),
      source: r.source,
      amount: Number(r.amount),
      currency: r.currency === "USD" ? "USD" : "BRL",
      impressions: r.impressions ? Number(r.impressions) : undefined,
      clicks: r.clicks ? Number(r.clicks) : undefined,
      conversions: r.conversions ? Number(r.conversions) : undefined,
      articleSlug: r.articleSlug || undefined,
      categorySlug: r.categorySlug || undefined,
      notes: r.notes || undefined,
      origin: r.origin || undefined,
      manual: !options.fromApi,
      createdAt: new Date().toISOString(),
    }));
  state.revenue = [...imported, ...state.revenue];
  return { state: saveMonetization(state), imported: imported.length };
}

/** Placeholder for future official network APIs when credentials are stored. */
export function tryNetworkRevenueImport() {
  const networks = getMonetization().networks.filter(
    (n) => n.apiKey && n.status !== "nao_configurado"
  );
  return {
    imported: 0,
    available: networks.map((n) => n.provider),
    message: networks.length
      ? `API keys salvas para: ${networks.map((n) => n.provider).join(", ")}. Conectores oficiais ainda não disponíveis — use importação JSON ou lançamento manual.`
      : "Nenhuma API key de rede configurada. Use importação JSON ou lançamento manual no painel de receita.",
  };
}

export function updateSetupStep(step: SetupStepId, done: boolean) {
  const state = getMonetization();
  state.setup.steps[step] = done;
  const allDone = Object.values(state.setup.steps).every(Boolean);
  state.setup.completed = allDone;
  if (allDone) state.setup.completedAt = new Date().toISOString();
  return saveMonetization(state);
}

export async function syncSetupProgress() {
  const state = getMonetization();
  const metrics = await getMetrics();
  const articles = listArticlesAdmin().filter((a) => a.status === "published");
  const slots = getAdSlots();
  const leads = getNewsletterLeads();

  state.setup.steps.ga4 = state.setup.steps.ga4 || Boolean(analyticsConfig.ga4Id);
  state.setup.steps.gtm = state.setup.steps.gtm || Boolean(analyticsConfig.gtmId);
  state.setup.steps.gsc =
    state.setup.steps.gsc || Boolean(analyticsConfig.searchConsoleVerification);
  state.setup.steps.adsense =
    state.setup.steps.adsense ||
    state.adsense.scriptInstalled ||
    Boolean(state.adsense.clientId);
  state.setup.steps.ad_slots =
    state.setup.steps.ad_slots || slots.some((s) => s.enabled);
  state.setup.steps.affiliates =
    state.setup.steps.affiliates || state.affiliates.some((a) => a.active);
  state.setup.steps.newsletter =
    state.setup.steps.newsletter || leads.length > 0 || metrics.newsletterSignups > 0;
  state.setup.steps.first_article =
    state.setup.steps.first_article || articles.length > 0;
  // SEO/indexing often confirmed manually after checklist
  const allDone = Object.values(state.setup.steps).every(Boolean);
  state.setup.completed = allDone;
  if (allDone && !state.setup.completedAt) {
    state.setup.completedAt = new Date().toISOString();
  }
  return saveMonetization(state);
}

export function getActiveBanners(position?: string) {
  const now = new Date();
  return getMonetization()
    .banners.filter((b) => {
      if (!b.active) return false;
      if (position && b.position !== position) return false;
      const start = b.startDate ? new Date(b.startDate) : null;
      const end = b.endDate ? new Date(b.endDate) : null;
      if (start && now < start) return false;
      if (end && now > end) return false;
      return true;
    })
    .sort((a, b) => b.priority - a.priority);
}

export async function getRevenueDashboard() {
  const state = getMonetization();
  const metrics = await getMetrics();
  const entries = state.revenue;

  const toBRL = (amount: number, currency: "BRL" | "USD") =>
    currency === "USD" ? amount * 5.2 : amount;

  const totalRevenue = entries.reduce((sum, e) => sum + toBRL(e.amount, e.currency), 0);
  const totalClicks = entries.reduce((sum, e) => sum + (e.clicks || 0), 0);
  const totalImpressions = entries.reduce((sum, e) => sum + (e.impressions || 0), 0);
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const rpm = totalImpressions > 0 ? (totalRevenue / totalImpressions) * 1000 : 0;
  const ecpm = rpm;

  const byMonthMap = new Map<string, number>();
  const byDayMap = new Map<string, number>();
  const byYearMap = new Map<string, number>();
  const byCategory = new Map<string, number>();
  const bySource = new Map<string, number>();
  const byArticle = new Map<string, { slug: string; revenue: number; conversions: number }>();
  const byOrigin = new Map<string, number>();

  for (const e of entries) {
    const brl = toBRL(e.amount, e.currency);
    const day = e.date.slice(0, 10);
    const month = e.date.slice(0, 7);
    const year = e.date.slice(0, 4);
    byDayMap.set(day, (byDayMap.get(day) || 0) + brl);
    byMonthMap.set(month, (byMonthMap.get(month) || 0) + brl);
    byYearMap.set(year, (byYearMap.get(year) || 0) + brl);
    bySource.set(e.source, (bySource.get(e.source) || 0) + brl);
    if (e.categorySlug) {
      byCategory.set(e.categorySlug, (byCategory.get(e.categorySlug) || 0) + brl);
    }
    if (e.origin) byOrigin.set(e.origin, (byOrigin.get(e.origin) || 0) + brl);
    if (e.articleSlug) {
      const prev = byArticle.get(e.articleSlug) || {
        slug: e.articleSlug,
        revenue: 0,
        conversions: 0,
      };
      prev.revenue += brl;
      prev.conversions += e.conversions || 0;
      byArticle.set(e.articleSlug, prev);
    }
  }

  const articles = listArticlesAdmin();
  const topRevenueArticles = [...byArticle.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8)
    .map((item) => ({
      ...item,
      title: articles.find((a) => a.slug === item.slug)?.title || item.slug,
    }));

  const topConverting = [...byArticle.values()]
    .sort((a, b) => b.conversions - a.conversions)
    .slice(0, 8)
    .map((item) => ({
      ...item,
      title: articles.find((a) => a.slug === item.slug)?.title || item.slug,
    }));

  return {
    estimatedRevenue: totalRevenue,
    clicks: totalClicks || metrics.events.cta_click || 0,
    impressions: totalImpressions || metrics.pageViews,
    ctr: Number(ctr.toFixed(2)),
    rpm: Number(rpm.toFixed(2)),
    ecpm: Number(ecpm.toFixed(2)),
    visitors: metrics.uniqueVisitors,
    sessions: Math.round(metrics.pageViews * 0.85),
    pageViews: metrics.pageViews,
    byMonth: [...byMonthMap.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([period, amount]) => ({ period, amount })),
    byDay: [...byDayMap.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-30)
      .map(([period, amount]) => ({ period, amount })),
    byYear: [...byYearMap.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([period, amount]) => ({ period, amount })),
    byCategory: [...byCategory.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({ category, amount })),
    bySource: [...bySource.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([source, amount]) => ({ source, amount })),
    byOrigin: [...byOrigin.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([origin, amount]) => ({ origin, amount })),
    topRevenueArticles,
    topConverting,
    entries: entries.slice(0, 50),
  };
}

export const SETUP_STEPS: {
  id: SetupStepId;
  title: string;
  description: string;
  href: string;
}[] = [
  {
    id: "ga4",
    title: "Conectar Google Analytics",
    description: "Informe o ID GA4 (G-XXXXXXXX) no ambiente ou marque como concluído.",
    href: "/admin/assistente",
  },
  {
    id: "gsc",
    title: "Conectar Google Search Console",
    description: "Adicione a meta de verificação do Search Console.",
    href: "/admin/assistente",
  },
  {
    id: "gtm",
    title: "Conectar Google Tag Manager",
    description: "Configure o container GTM (GTM-XXXXXXX).",
    href: "/admin/assistente",
  },
  {
    id: "adsense",
    title: "Inserir Publisher ID do AdSense",
    description: "Cadastre Client ID e script do Google AdSense.",
    href: "/admin/monetizacao/adsense",
  },
  {
    id: "ad_slots",
    title: "Configurar espaços de anúncios",
    description: "Ative os slots estratégicos sem prejudicar a leitura.",
    href: "/admin/anuncios",
  },
  {
    id: "affiliates",
    title: "Cadastrar programas de afiliados",
    description: "Amazon, Hotmart, Eduzz e outros programas.",
    href: "/admin/monetizacao/afiliados",
  },
  {
    id: "newsletter",
    title: "Configurar newsletter",
    description: "Valide a captura de e-mails no site.",
    href: "/admin/newsletter",
  },
  {
    id: "seo",
    title: "Verificar SEO",
    description: "Confirme title, description, schema e sitemap.",
    href: "/sitemap.xml",
  },
  {
    id: "indexing",
    title: "Testar indexação",
    description: "Envie o sitemap no Search Console e valide robots.txt.",
    href: "/robots.txt",
  },
  {
    id: "first_article",
    title: "Publicar o primeiro artigo",
    description: "Publique ou confirme que há conteúdo no ar.",
    href: "/admin/artigos/novo",
  },
];

export function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
