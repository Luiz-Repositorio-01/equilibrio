export type ArticleStatus = "published" | "draft" | "scheduled";

export type ArticleSeo = {
  title: string;
  description: string;
  keywords: string[];
};

export type TocItem = {
  id: string;
  title: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  content: string;
  contentText?: string;
  author: string;
  category: string;
  categorySlug: string;
  tags: string[];
  coverImage: string;
  coverAlt: string;
  coverCaption?: string;
  coverDescription?: string;
  coverVariants?: {
    featured: string;
    og: string;
    twitter: string;
    thumb: string;
    home: string;
    share: string;
  };
  coverMeta?: {
    style: string;
    layout: string;
    sentiment: string;
    keywords: string[];
    lighting: string;
    motif: string;
    generatedAt: string;
    seed: number;
    engine: string;
    /** Crédito da fotografia real (banco gratuito), quando aplicável */
    credit?: string;
    creditUrl?: string;
    source?: string;
  };
  publishedAt: string;
  updatedAt: string;
  readingTime: number;
  featured: boolean;
  status: ArticleStatus;
  views: number;
  likes: number;
  seo: ArticleSeo;
  toc: TocItem[];
  sourceFile?: string;
  faq: FaqItem[];
  scheduledFor?: string;
  /** URL pública do áudio do artigo (mp3/m4a/ogg) — opcional */
  audioUrl?: string;
  /** Trecho curto da Dica de Ouro para a lateral */
  goldTip?: string;
  /** Textos opcionais dos 3 boxes "Na prática" (vazio = automático). */
  integrationPractice?: {
    personal?: string;
    family?: string;
    professional?: string;
  };
};

export type ArticleSummary = Omit<Article, "content" | "contentText" | "toc" | "faq" | "sourceFile">;

export type NewsletterLead = {
  id: string;
  email: string;
  createdAt: string;
  source: string;
};

export type AnalyticsEvent = {
  id: string;
  name: string;
  path?: string;
  slug?: string;
  meta?: Record<string, string | number | boolean>;
  createdAt: string;
};

export type AdSlotConfig = {
  id: string;
  label: string;
  position: string;
  enabled: boolean;
  provider: "adsense" | "admanager" | "ezoic" | "mediavine" | "raptive" | "taboola" | "outbrain" | "custom";
  code?: string;
};

export type SiteMetrics = {
  pageViews: number;
  uniqueVisitors: number;
  newsletterSignups: number;
  avgScroll: number;
  avgReadingTime: number;
  topArticles: { slug: string; title: string; views: number }[];
  events: Record<string, number>;
};

export type AdSenseStatus = "nao_configurado" | "em_analise" | "aprovado" | "ativo";

export type AdSenseConfig = {
  publisherId: string;
  clientId: string;
  script: string;
  status: AdSenseStatus;
  scriptInstalled: boolean;
  lastCheckedAt?: string;
  notes?: string;
};

export type AdManagerBlock = {
  id: string;
  name: string;
  adUnitPath: string;
  sizes: string;
  enabled: boolean;
};

export type AdManagerConfig = {
  networkId: string;
  tags: string[];
  blocks: AdManagerBlock[];
};

export type AffiliateProgram =
  | "amazon"
  | "hotmart"
  | "eduzz"
  | "monetizze"
  | "shopee"
  | "mercado_livre"
  | "aliexpress"
  | "outro";

export type AffiliateAccount = {
  id: string;
  program: AffiliateProgram;
  customName?: string;
  accountId: string;
  affiliateTag: string;
  dashboardUrl?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
};

export type AdNetworkProvider =
  | "ezoic"
  | "mediavine"
  | "raptive"
  | "monetag"
  | "propellerads"
  | "taboola"
  | "outbrain";

export type AdNetworkConfig = {
  id: string;
  provider: AdNetworkProvider;
  accountId: string;
  siteId?: string;
  script?: string;
  apiKey?: string;
  status: "nao_configurado" | "conectado" | "ativo" | "pausado";
  notes?: string;
};

export type BannerPosition =
  | "home-top"
  | "home-feed"
  | "article-sidebar"
  | "article-end"
  | "sponsor"
  | "footer";

export type BannerConfig = {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  position: BannerPosition;
  priority: number;
  startDate: string;
  endDate: string;
  active: boolean;
  clicks: number;
  impressions: number;
};

export type BankingInfo = {
  holderName: string;
  document: string;
  bank: string;
  agency: string;
  account: string;
  pixKey: string;
  notes?: string;
  updatedAt?: string;
};

export type RevenueSource =
  | "adsense"
  | "admanager"
  | "affiliate"
  | "ezoic"
  | "mediavine"
  | "raptive"
  | "monetag"
  | "propellerads"
  | "taboola"
  | "outbrain"
  | "sponsor"
  | "other";

export type RevenueEntry = {
  id: string;
  date: string;
  source: RevenueSource;
  amount: number;
  currency: "BRL" | "USD";
  impressions?: number;
  clicks?: number;
  conversions?: number;
  articleSlug?: string;
  categorySlug?: string;
  notes?: string;
  origin?: string;
  manual: boolean;
  createdAt: string;
};

export type SetupStepId =
  | "ga4"
  | "gsc"
  | "gtm"
  | "adsense"
  | "ad_slots"
  | "affiliates"
  | "newsletter"
  | "seo"
  | "indexing"
  | "first_article";

export type SetupWizardState = {
  completed: boolean;
  steps: Record<SetupStepId, boolean>;
  dismissedAt?: string;
  completedAt?: string;
};

export type MonetizationState = {
  adsense: AdSenseConfig;
  adManager: AdManagerConfig;
  affiliates: AffiliateAccount[];
  networks: AdNetworkConfig[];
  banners: BannerConfig[];
  banking: BankingInfo;
  revenue: RevenueEntry[];
  setup: SetupWizardState;
};
