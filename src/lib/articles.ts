import type { Article, ArticleSummary } from "./types";
import { loadAllArticles } from "./cms";
import { applyEditorial } from "./editorial";

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
  let out = html.replace(/<p>\s*Artigo\s+\d+\s*:[^<]*<\/p>\s*/gi, "");

  out = out.replace(/<p>\s*\(Nota de Link Interno:[\s\S]*?<\/p>/gi, (match) => {
    if (/Detox Mental|Excesso de Informação/i.test(match)) {
      return `<p>Quando a fome chega junto com pressa ou irritação, o próximo passo útil está na mente, não em outra regra alimentar. Leia <a href="/artigos/saude-mental-cuidando-da-mente-em-tempos-de-incerteza-e-ansiedade">como cuidar da mente em tempos de incerteza</a>.</p>`;
    }
    if (/Ansiedade Sob Controle/i.test(match)) {
      return `<p>Postura e tensão emocional andam juntas. Para reconhecer o estresse antes que ele vire só “cansaço normal”, veja <a href="/artigos/estresse-no-dia-a-dia-como-reconhecer-os-sinais-e-agir-antes-que-vire-um-problem">os sinais do estresse no dia a dia</a>.</p>`;
    }
    return "";
  });

  out = out
    .replace(/e o Chá Antropofágico/gi, "")
    .replace(
      /Esse é o tempo exato que o sistema digestivo leva para enviar sinais químicos ao cérebro \(através do hormônio leptina\) avisando que o corpo já está satisfeito\./g,
      "Vinte minutos é uma pausa prática para perceber saciedade. Não é um cronômetro hormonal igual para todo mundo: sono, o que você comeu antes e o tamanho do prato mudam esse tempo."
    )
    .replace(
      /Para potencializar esse hábito, adote o ritual de consumir uma pequena xícara \(cerca de 50ml\) de um chá morno e digestivo de alecrim com hortelã exatamente 15 minutos antes da sua refeição principal\. Esse composto amargo estimula a produção de suco gástrico e enzimas pancreáticas de forma natural, preparando o estômago para uma digestão leve e eficiente, eliminando aquela moleza pesada que costuma dar logo após o almoço\./g,
      "Se ajudar a desacelerar, beba água ou um chá morno sem açúcar alguns minutos antes de comer. Isso é um ritual de pausa. Este texto não afirma que alecrim com hortelã acione enzimas, trate digestão ou impeça o sono depois do almoço."
    )
    .replace(
      /agem como verdadeiros remédios naturais\. Eles neutralizam os radicais livres e devolvem às células o ambiente ideal para que elas se regenerem e funcionem perfeitamente\./g,
      "ajudam a variar o prato. Nenhum alimento isolado funciona como remédio, apaga inflamação ou regenera células sob encomenda."
    )
    .replace(
      /A base da maioria das doenças modernas — desde o cansaço crônico até problemas cardiovasculares e dores articulares — é a inflamação crônica subclínica\./g,
      "Cansaço, pouca variedade no prato e rotina apertada aparecem juntos com frequência. Isso não autoriza dizer que uma inflamação escondida é a causa da maioria das doenças."
    )
    .replace(/massageia e cura os órgãos internos/gi, "relaxa o abdômen, sem promessa de cura");

  return out
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

/** Versão pública do artigo: limpa resíduos editoriais e acrescenta a aplicação prática. */
export function presentArticle(article: Article): Article {
  return applyEditorial({
    ...article,
    content: enhanceContent(article.content),
  });
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
  return presentArticle(article);
}

/** Slugs publicados para pré-geração; artigos novos são gerados sob demanda. */
export async function getAllSlugs(): Promise<string[]> {
  return (await loadAllArticles()).map((a) => a.slug);
}

/**
 * "Destaque do dia" da home (dia no fuso de Brasília):
 * 1) artigo publicado HOJE tem prioridade (se houver vários, o mais novo);
 * 2) nos demais dias, percorre todos os artigos publicados em rodízio contínuo,
 *    um por dia, do mais antigo ao mais novo, e recomeça quando chega ao fim.
 */
export async function getFeaturedArticle(now = Date.now()): Promise<ArticleSummary | null> {
  const all = await getArticleSummaries(); // mais novo primeiro
  if (!all.length) return null;

  const brNow = now - 3 * 3600 * 1000;
  const today = new Date(brNow).toISOString().slice(0, 10);

  const publishedToday = all.find((a) => a.publishedAt === today);
  if (publishedToday) return publishedToday;

  const loop = [...all].reverse(); // mais antigo -> mais novo
  const dayNumber = Math.floor(brNow / 86_400_000);
  return loop[dayNumber % loop.length];
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
  const presentedText = new Map(
    (await allEffective()).map((article) => [
      article.slug,
      presentArticle(article).contentText || "",
    ])
  );

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
      const contentHay = (presentedText.get(a.slug) || "").toLowerCase();
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
  const value = /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T12:00:00-03:00` : date;
  const parsed = new Date(value);
  if (Number.isNaN(+parsed)) return date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).format(parsed);
}

/** Returns a displayable author name, or null when empty/placeholder. */
export function resolveAuthor(author?: string): string | null {
  const a = (author || "").trim();
  if (!a) return null;
  if (/^\[.*\]$/.test(a)) return null;
  return a;
}
