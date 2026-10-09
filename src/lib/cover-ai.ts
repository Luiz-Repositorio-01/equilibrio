import fs from "fs";
import path from "path";
import sharp from "sharp";
import type { Article } from "./types";
import { loadAllArticles } from "./cms";

export type CoverStyle =
  | "Minimalista Premium"
  | "Editorial"
  | "Fotografia Realista"
  | "Ilustração"
  | "3D"
  | "Cinema"
  | "Natureza"
  | "Saúde"
  | "Espiritualidade"
  | "Mente"
  | "Corpo"
  | "Lifestyle"
  | "Contemporâneo"
  | "Luxo"
  | "Orgânico"
  | "Moderno";

export type CoverLayout =
  | "split-diagonal"
  | "centered-orb"
  | "magazine-left"
  | "waves-horizon"
  | "geometric-stack"
  | "portrait-band"
  | "abstract-layers"
  | "radial-focus"
  | "asymmetric-frame"
  | "soft-grid";

export type CoverSentiment =
  | "calmo"
  | "energizante"
  | "reflexivo"
  | "esperançoso"
  | "sereno"
  | "poderoso"
  | "acolhedor"
  | "inspirador";

export type CoverBrief = {
  seed: number;
  style: CoverStyle;
  layout: CoverLayout;
  sentiment: CoverSentiment;
  keywords: string[];
  palette: {
    bg: string;
    mid: string;
    accent: string;
    soft: string;
    text: string;
    ink: string;
  };
  lighting: string;
  motif: string;
  texture: string;
  framing: string;
  typography: "serif-editorial" | "sans-clean" | "display-mixed";
};

export type CoverVariants = {
  featured: string;
  og: string;
  twitter: string;
  thumb: string;
  home: string;
  share: string;
};

export type CoverPackage = {
  coverImage: string;
  coverAlt: string;
  coverCaption: string;
  coverDescription: string;
  coverVariants: CoverVariants;
  coverMeta: {
    style: CoverStyle;
    layout: CoverLayout;
    sentiment: CoverSentiment;
    keywords: string[];
    lighting: string;
    motif: string;
    generatedAt: string;
    seed: number;
    engine: string;
    credit?: string;
    creditUrl?: string;
    source?: string;
  };
};

const STYLES: CoverStyle[] = [
  "Minimalista Premium",
  "Editorial",
  "Fotografia Realista",
  "Ilustração",
  "3D",
  "Cinema",
  "Natureza",
  "Saúde",
  "Espiritualidade",
  "Mente",
  "Corpo",
  "Lifestyle",
  "Contemporâneo",
  "Luxo",
  "Orgânico",
  "Moderno",
];

const LAYOUTS: CoverLayout[] = [
  "split-diagonal",
  "centered-orb",
  "magazine-left",
  "waves-horizon",
  "geometric-stack",
  "portrait-band",
  "abstract-layers",
  "radial-focus",
  "asymmetric-frame",
  "soft-grid",
];

const LIGHTINGS = [
  "luz lateral dourada",
  "luz suave difusa",
  "contraste cinematográfico",
  "brilho matinal",
  "penumbra serena",
  "halo espiritual",
  "luz azulada noturna",
  "claridade limpa",
];

const TEXTURES = [
  "papel texturizado sutil",
  "granulado fino",
  "vidro fosco",
  "tecido orgânico",
  "névoa suave",
  "superfície polida",
  "fibra natural",
  "água translúcida",
];

const FRAMINGS = [
  "plano aberto",
  "close atmosférico",
  "enquadramento assimétrico",
  "centralidade forte",
  "margem generosa",
  "corte diagonal",
  "profundidade em camadas",
  "composição em terços",
];

const PALETTES = [
  { bg: "#0A2540", mid: "#163A5F", accent: "#C9A96E", soft: "#6FA8DC", text: "#F7F4EF", ink: "#0A2540" },
  { bg: "#102A43", mid: "#243B53", accent: "#E8C47C", soft: "#9FB3C8", text: "#F0F4F8", ink: "#102A43" },
  { bg: "#1B2A41", mid: "#324A6D", accent: "#D4A373", soft: "#A3C4DC", text: "#FFF8F0", ink: "#1B2A41" },
  { bg: "#0D1B2A", mid: "#1B3A4B", accent: "#F2CC8F", soft: "#7EB8DA", text: "#EEF6FF", ink: "#0D1B2A" },
  { bg: "#14213D", mid: "#2A3F66", accent: "#C9A227", soft: "#8ECAE6", text: "#F8F9FA", ink: "#14213D" },
  { bg: "#1A1A2E", mid: "#2E3A59", accent: "#E0B15B", soft: "#89A7C2", text: "#F5F1E8", ink: "#1A1A2E" },
  { bg: "#0F2C3C", mid: "#1E4A5C", accent: "#D9B48F", soft: "#6FA8A0", text: "#F4F7F5", ink: "#0F2C3C" },
  { bg: "#201A23", mid: "#3A2F45", accent: "#C9A96E", soft: "#9B8AA6", text: "#F8F1E9", ink: "#201A23" },
  { bg: "#12263A", mid: "#234E70", accent: "#F0C987", soft: "#5DADE2", text: "#FDFEFE", ink: "#12263A" },
  { bg: "#182C25", mid: "#2F4F44", accent: "#C9A96E", soft: "#7D9B8A", text: "#F3F7F4", ink: "#182C25" },
  { bg: "#2C1810", mid: "#4A2C1A", accent: "#E8B86D", soft: "#C48B5F", text: "#FFF6EB", ink: "#2C1810" },
  { bg: "#1C2331", mid: "#344055", accent: "#B8C5D6", soft: "#6FA8DC", text: "#F5F7FA", ink: "#1C2331" },
  { bg: "#231F20", mid: "#3D3536", accent: "#C9A96E", soft: "#A67C52", text: "#FAF6F1", ink: "#231F20" },
  { bg: "#0B132B", mid: "#1C2541", accent: "#5BC0BE", soft: "#3A506B", text: "#F0F7F7", ink: "#0B132B" },
  { bg: "#2B2118", mid: "#4A3828", accent: "#D4A373", soft: "#8B7355", text: "#FFF8F0", ink: "#2B2118" },
  { bg: "#152238", mid: "#2B3F63", accent: "#F4D35E", soft: "#7EA8BE", text: "#FFFEF7", ink: "#152238" },
];

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(arr: T[], seed: number, salt = 0): T {
  return arr[(seed + salt * 97) % arr.length];
}

function extractKeywords(text: string, tags: string[]): string[] {
  const stop = new Set([
    "para", "como", "sobre", "uma", "com", "pelo", "pela", "dos", "das", "que", "não", "mais",
    "seu", "sua", "seus", "suas", "este", "esta", "isso", "aqui", "quando", "onde", "porque",
    "entre", "também", "muito", "pode", "ser", "são", "foi", "tem", "ter", "nos", "nas",
  ]);
  const fromTags = tags.map((t) => t.toLowerCase());
  const words = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 4 && !stop.has(w));
  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
  const ranked = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => w)
    .slice(0, 8);
  return [...new Set([...fromTags, ...ranked])].slice(0, 10);
}

function detectSentiment(text: string, categorySlug: string): CoverSentiment {
  const t = text.toLowerCase();
  if (/ansiedade|estresse|medo|preocup/.test(t)) return "acolhedor";
  if (/energia|vital|força|movimento|treino/.test(t)) return "energizante";
  if (/paz|silêncio|medita|espiritual|gratidão|presença/.test(t)) return "sereno";
  if (/esperança|futuro|longevidade|transform/.test(t)) return "esperançoso";
  if (/foco|mente|clareza|decisão/.test(t)) return "reflexivo";
  if (/poder|disciplina|hábito|consistência/.test(t)) return "poderoso";
  if (categorySlug === "saude-espiritual") return "sereno";
  if (categorySlug === "saude-do-corpo") return "energizante";
  if (categorySlug === "saude-da-mente") return "reflexivo";
  return "inspirador";
}

function detectMotif(keywords: string[], title: string): string {
  const blob = `${title} ${keywords.join(" ")}`.toLowerCase();
  if (/respir|oxigen|diafrag/.test(blob)) return "arcos-respiratorios";
  if (/articul|joelh|coluna|longevid/.test(blob)) return "estrutura-articular";
  if (/sono|dormir|noite/.test(blob)) return "lua-e-ondas";
  if (/intestino|fígado|rim|detox|desintox/.test(blob)) return "formas-organicas";
  if (/medita|espiritual|alma|presença/.test(blob)) return "halo-contemplativo";
  if (/ansiedad|mente|pensamento/.test(blob)) return "linhas-mentais";
  if (/nutri|aliment|comida/.test(blob)) return "folhas-e-luz";
  if (/água|hidrata/.test(blob)) return "gotas-e-fluxo";
  if (/postura|moviment|yoga/.test(blob)) return "silhueta-movimento";
  return "geometria-vital";
}

function styleForCategory(categorySlug: string, seed: number): CoverStyle {
  const byCat: Record<string, CoverStyle[]> = {
    "saude-do-corpo": ["Corpo", "Saúde", "Natureza", "Lifestyle", "Fotografia Realista", "Moderno"],
    "saude-da-mente": ["Mente", "Editorial", "Minimalista Premium", "Contemporâneo", "Cinema", "Ilustração"],
    "saude-espiritual": ["Espiritualidade", "Orgânico", "Luxo", "Ilustração", "Cinema", "Natureza"],
  };
  const pool = byCat[categorySlug] || STYLES;
  return pick(pool, seed, 3);
}

export function analyzeCoverBrief(input: {
  slug: string;
  title: string;
  subtitle?: string;
  excerpt?: string;
  contentText?: string;
  category?: string;
  categorySlug?: string;
  tags?: string[];
  forceSeed?: number;
}): CoverBrief {
  const text = [
    input.title,
    input.subtitle || "",
    input.excerpt || "",
    (input.contentText || "").slice(0, 2500),
    (input.tags || []).join(" "),
  ].join(" ");

  const seed = input.forceSeed ?? hashString(`${input.slug}|${input.title}|${text.slice(0, 400)}`);
  const keywords = extractKeywords(text, input.tags || []);
  const sentiment = detectSentiment(text, input.categorySlug || "");
  const style = styleForCategory(input.categorySlug || "", seed);
  const layout = pick(LAYOUTS, seed, 5);
  const palette = pick(PALETTES, seed, 7);
  const lighting = pick(LIGHTINGS, seed, 11);
  const texture = pick(TEXTURES, seed, 13);
  const framing = pick(FRAMINGS, seed, 17);
  const motif = detectMotif(keywords, input.title);
  const typography = pick(
    ["serif-editorial", "sans-clean", "display-mixed"] as const,
    seed,
    19
  );

  return {
    seed,
    style,
    layout,
    sentiment,
    keywords,
    palette,
    lighting,
    motif,
    texture,
    framing,
    typography,
  };
}

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapTitle(title: string, max = 36): string[] {
  const words = title.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const next = current ? `${current} ${w}` : w;
    if (next.length > max && current) {
      lines.push(current);
      current = w;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function motifShapes(brief: CoverBrief, w: number, h: number): string {
  const { motif, palette: p, seed } = brief;
  const a = (seed % 40) + 20;
  const b = ((seed >> 3) % 50) + 30;
  const cx = w * 0.5;
  const cy = h * 0.48;

  switch (motif) {
    case "arcos-respiratorios":
      return Array.from({ length: 6 }, (_, i) => {
        const y = cy - 40 + i * 32;
        const rx = 140 + i * 48 + a;
        return `<ellipse cx="${cx}" cy="${y}" rx="${rx}" ry="${22 + i * 3}" fill="none" stroke="${p.soft}" stroke-opacity="${0.2 + i * 0.05}" stroke-width="2.2"/>`;
      }).join("");
    case "estrutura-articular":
      return `
        <circle cx="${cx}" cy="${cy - 40}" r="22" fill="${p.accent}" opacity="0.9"/>
        <circle cx="${cx + 70}" cy="${cy + 30}" r="16" fill="${p.soft}" opacity="0.75"/>
        <circle cx="${cx - 70}" cy="${cy + 36}" r="14" fill="${p.accent}" opacity="0.6"/>
        <path d="M${cx} ${cy - 40} L${cx + 70} ${cy + 30} L${cx - 70} ${cy + 36} Z" fill="none" stroke="${p.text}" stroke-opacity="0.28" stroke-width="2.5"/>
      `;
    case "lua-e-ondas":
      return `
        <circle cx="${cx + 40}" cy="${h * 0.3}" r="88" fill="${p.accent}" opacity="0.38"/>
        <circle cx="${cx + 58}" cy="${h * 0.28}" r="88" fill="${p.bg}"/>
        <path d="M0 ${h * 0.68} Q ${w * 0.25} ${h * 0.58}, ${w * 0.5} ${h * 0.7} T ${w} ${h * 0.66} V ${h} H0 Z" fill="${p.mid}" opacity="0.6"/>
        <path d="M0 ${h * 0.76} Q ${w * 0.3} ${h * 0.68}, ${w * 0.55} ${h * 0.78} T ${w} ${h * 0.74} V ${h} H0 Z" fill="${p.soft}" opacity="0.22"/>
      `;
    case "formas-organicas":
      return `
        <ellipse cx="${cx + 30}" cy="${cy}" rx="${140 + a}" ry="${100 + b}" fill="${p.soft}" opacity="0.28"/>
        <ellipse cx="${cx - 50}" cy="${cy + 40}" rx="${90 + a / 2}" ry="${120 + b / 2}" fill="${p.accent}" opacity="0.22"/>
        <ellipse cx="${cx + 90}" cy="${cy + 50}" rx="70" ry="90" fill="${p.mid}" opacity="0.5"/>
      `;
    case "halo-contemplativo":
      return `
        <circle cx="${cx}" cy="${cy}" r="200" fill="none" stroke="${p.accent}" stroke-opacity="0.22" stroke-width="1.8"/>
        <circle cx="${cx}" cy="${cy}" r="140" fill="none" stroke="${p.soft}" stroke-opacity="0.28" stroke-width="1.8"/>
        <circle cx="${cx}" cy="${cy}" r="72" fill="none" stroke="${p.accent}" stroke-opacity="0.35" stroke-width="1.5"/>
        <circle cx="${cx}" cy="${cy}" r="36" fill="${p.accent}" opacity="0.65"/>
      `;
    case "linhas-mentais":
      return Array.from({ length: 9 }, (_, i) => {
        const y = h * 0.22 + i * 48;
        const x1 = w * 0.18 + ((seed + i * 13) % 50);
        return `<line x1="${x1}" y1="${y}" x2="${w * 0.82}" y2="${y + ((i % 2) * 16 - 8)}" stroke="${i % 2 ? p.accent : p.soft}" stroke-opacity="${0.18 + (i % 3) * 0.08}" stroke-width="2.2"/>`;
      }).join("");
    case "folhas-e-luz":
      return `
        <g opacity="0.42" fill="${p.accent}">
          <ellipse cx="${cx - 20}" cy="${cy - 30}" rx="48" ry="86" transform="rotate(-25 ${cx - 20} ${cy - 30})"/>
          <ellipse cx="${cx + 50}" cy="${cy + 10}" rx="40" ry="74" transform="rotate(18 ${cx + 50} ${cy + 10})"/>
          <ellipse cx="${cx - 60}" cy="${cy + 50}" rx="34" ry="64" transform="rotate(-10 ${cx - 60} ${cy + 50})"/>
        </g>
        <circle cx="${cx + 80}" cy="${cy - 60}" r="50" fill="${p.soft}" opacity="0.15"/>
      `;
    case "gotas-e-fluxo":
      return `
        <path d="M${cx} ${h * 0.22} Q ${cx + 90} ${cy}, ${cx} ${h * 0.72} Q ${cx - 90} ${cy}, ${cx} ${h * 0.22} Z" fill="${p.soft}" opacity="0.38"/>
        <circle cx="${cx + 70}" cy="${h * 0.68}" r="20" fill="${p.accent}" opacity="0.5"/>
        <circle cx="${cx - 60}" cy="${h * 0.62}" r="12" fill="${p.soft}" opacity="0.45"/>
      `;
    case "silhueta-movimento":
      return `
        <path d="M${cx - 10} ${h * 0.2} C ${cx + 60} ${h * 0.35}, ${cx - 50} ${h * 0.5}, ${cx + 40} ${h * 0.74}" fill="none" stroke="${p.accent}" stroke-width="10" stroke-linecap="round" opacity="0.6"/>
        <circle cx="${cx - 10}" cy="${h * 0.18}" r="26" fill="${p.soft}" opacity="0.55"/>
      `;
    default:
      return `
        <rect x="${cx - 110}" y="${cy - 110}" width="220" height="220" rx="32" fill="${p.mid}" opacity="0.55" transform="rotate(${a - 20} ${cx} ${cy})"/>
        <circle cx="${cx + 60}" cy="${cy + 40}" r="100" fill="${p.soft}" opacity="0.22"/>
        <circle cx="${cx - 40}" cy="${cy}" r="48" fill="${p.accent}" opacity="0.4"/>
      `;
  }
}

function layoutBackground(brief: CoverBrief, w: number, h: number): string {
  const p = brief.palette;
  switch (brief.layout) {
    case "split-diagonal":
      return `
        <polygon points="0,0 ${w * 0.62},0 ${w * 0.38},${h} 0,${h}" fill="${p.bg}"/>
        <polygon points="${w * 0.62},0 ${w},0 ${w},${h} ${w * 0.38},${h}" fill="${p.mid}"/>
      `;
    case "centered-orb":
      return `
        <rect width="${w}" height="${h}" fill="${p.bg}"/>
        <circle cx="${w * 0.5}" cy="${h * 0.45}" r="${h * 0.42}" fill="${p.mid}" opacity="0.7"/>
        <circle cx="${w * 0.5}" cy="${h * 0.45}" r="${h * 0.22}" fill="${p.soft}" opacity="0.18"/>
      `;
    case "magazine-left":
      return `
        <rect width="${w}" height="${h}" fill="${p.bg}"/>
        <rect x="0" y="0" width="${w * 0.42}" height="${h}" fill="${p.mid}"/>
        <rect x="${w * 0.42}" y="0" width="8" height="${h}" fill="${p.accent}" opacity="0.7"/>
      `;
    case "waves-horizon":
      return `
        <rect width="${w}" height="${h}" fill="${p.bg}"/>
        <path d="M0 ${h * 0.55} Q ${w * 0.25} ${h * 0.45}, ${w * 0.5} ${h * 0.58} T ${w} ${h * 0.52} V ${h} H0 Z" fill="${p.mid}"/>
        <path d="M0 ${h * 0.65} Q ${w * 0.3} ${h * 0.58}, ${w * 0.55} ${h * 0.68} T ${w} ${h * 0.62} V ${h} H0 Z" fill="${p.soft}" opacity="0.25"/>
      `;
    case "geometric-stack":
      return `
        <rect width="${w}" height="${h}" fill="${p.bg}"/>
        <rect x="${w * 0.55}" y="${h * 0.12}" width="${w * 0.35}" height="${h * 0.28}" fill="${p.mid}"/>
        <rect x="${w * 0.62}" y="${h * 0.38}" width="${w * 0.28}" height="${h * 0.22}" fill="${p.soft}" opacity="0.35"/>
        <rect x="${w * 0.5}" y="${h * 0.58}" width="${w * 0.4}" height="${h * 0.28}" fill="${p.accent}" opacity="0.25"/>
      `;
    case "portrait-band":
      return `
        <rect width="${w}" height="${h}" fill="${p.mid}"/>
        <rect x="0" y="${h * 0.18}" width="${w}" height="${h * 0.64}" fill="${p.bg}"/>
        <rect x="0" y="${h * 0.18}" width="${w}" height="6" fill="${p.accent}" opacity="0.8"/>
        <rect x="0" y="${h * 0.82}" width="${w}" height="6" fill="${p.soft}" opacity="0.5"/>
      `;
    case "abstract-layers":
      return `
        <rect width="${w}" height="${h}" fill="${p.bg}"/>
        <ellipse cx="${w * 0.2}" cy="${h * 0.2}" rx="260" ry="180" fill="${p.mid}" opacity="0.8"/>
        <ellipse cx="${w * 0.85}" cy="${h * 0.8}" rx="300" ry="200" fill="${p.soft}" opacity="0.2"/>
        <ellipse cx="${w * 0.7}" cy="${h * 0.25}" rx="140" ry="140" fill="${p.accent}" opacity="0.15"/>
      `;
    case "radial-focus":
      return `
        <rect width="${w}" height="${h}" fill="${p.bg}"/>
        <circle cx="${w * 0.72}" cy="${h * 0.5}" r="280" fill="${p.mid}" opacity="0.55"/>
        <circle cx="${w * 0.72}" cy="${h * 0.5}" r="160" fill="${p.soft}" opacity="0.12"/>
      `;
    case "asymmetric-frame":
      return `
        <rect width="${w}" height="${h}" fill="${p.bg}"/>
        <rect x="${w * 0.08}" y="${h * 0.1}" width="${w * 0.84}" height="${h * 0.8}" fill="none" stroke="${p.accent}" stroke-opacity="0.45" stroke-width="2"/>
        <rect x="${w * 0.12}" y="${h * 0.15}" width="${w * 0.5}" height="${h * 0.7}" fill="${p.mid}" opacity="0.55"/>
      `;
    case "soft-grid":
    default:
      return `
        <rect width="${w}" height="${h}" fill="${p.bg}"/>
        ${Array.from({ length: 6 }, (_, i) =>
          `<line x1="${(w / 6) * (i + 1)}" y1="0" x2="${(w / 6) * (i + 1)}" y2="${h}" stroke="${p.text}" stroke-opacity="0.04"/>`
        ).join("")}
        ${Array.from({ length: 4 }, (_, i) =>
          `<line x1="0" y1="${(h / 4) * (i + 1)}" x2="${w}" y2="${(h / 4) * (i + 1)}" stroke="${p.text}" stroke-opacity="0.04"/>`
        ).join("")}
        <rect x="${w * 0.55}" y="${h * 0.2}" width="${w * 0.35}" height="${h * 0.55}" fill="${p.mid}" opacity="0.45"/>
      `;
  }
}

export function renderCoverSvg(
  brief: CoverBrief,
  title: string,
  category: string,
  opts?: { width?: number; height?: number; showTitle?: boolean; showLabels?: boolean }
): string {
  const w = opts?.width ?? 1600;
  const h = opts?.height ?? 900;
  /** Site cards: arte pura. Social (og/share): texto seguro nas margens. */
  const showTitle = opts?.showTitle === true;
  const showLabels = opts?.showLabels === true || showTitle;
  const p = brief.palette;
  const lines = wrapTitle(title, brief.layout === "magazine-left" ? 28 : 34);
  const titleFont =
    brief.typography === "sans-clean"
      ? "Segoe UI, Helvetica, Arial, sans-serif"
      : "Georgia, 'Times New Roman', serif";
  const titleSize = Math.max(28, Math.round(Math.min(w, h) * 0.045));
  const padX = Math.round(w * 0.08);
  const titleY = Math.round(h * 0.42);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p.accent}" stop-opacity="0.4"/>
      <stop offset="50%" stop-color="${p.soft}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${p.bg}" stop-opacity="0.2"/>
    </linearGradient>
    <radialGradient id="vignette" cx="50%" cy="48%" r="70%">
      <stop offset="0%" stop-color="${p.mid}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${p.bg}" stop-opacity="0.55"/>
    </radialGradient>
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.045"/>
      </feComponentTransfer>
    </filter>
  </defs>
  ${layoutBackground(brief, w, h)}
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  <rect width="${w}" height="${h}" fill="url(#vignette)"/>
  <rect width="${w}" height="${h}" filter="url(#noise)" opacity="0.5"/>
  ${motifShapes(brief, w, h)}
  ${
    showLabels
      ? `<text x="${padX}" y="${Math.round(h * 0.12)}" fill="${p.accent}" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="${Math.round(h * 0.028)}" letter-spacing="3.5" font-weight="600">${escapeXml(category.toUpperCase())}</text>`
      : ""
  }
  ${
    showTitle
      ? lines
          .map(
            (line, i) =>
              `<text x="${padX}" y="${titleY + i * (titleSize + 12)}" fill="${p.text}" font-family="${titleFont}" font-size="${titleSize}" font-weight="700">${escapeXml(line)}</text>`
          )
          .join("\n  ")
      : ""
  }
</svg>`;
}

function metaCopy(brief: CoverBrief, title: string, category: string) {
  const kw = brief.keywords.slice(0, 4).join(", ");
  const coverAlt = `Capa editorial do artigo “${title}” — estilo ${brief.style}, atmosfera ${brief.sentiment}, tema ${category}${kw ? `, palavras-chave: ${kw}` : ""}`;
  const coverCaption = `${title} · composição ${brief.layout.replace(/-/g, " ")} · ${brief.lighting}`;
  const coverDescription = `Arte de capa exclusiva gerada por IA de composição a partir do conteúdo do artigo. Estilo ${brief.style}, iluminação ${brief.lighting}, textura ${brief.texture}, enquadramento ${brief.framing}, motivo visual ${brief.motif.replace(/-/g, " ")}.`;
  return { coverAlt, coverCaption, coverDescription };
}

const VARIANT_SPECS: { key: keyof CoverVariants; width: number; height: number; file: string }[] = [
  { key: "featured", width: 1600, height: 900, file: "featured.webp" },
  { key: "og", width: 1200, height: 630, file: "og.webp" },
  { key: "twitter", width: 1200, height: 600, file: "twitter.webp" },
  { key: "thumb", width: 640, height: 360, file: "thumb.webp" },
  { key: "home", width: 960, height: 540, file: "home.webp" },
  { key: "share", width: 1080, height: 1080, file: "share.webp" },
];

async function generateArtCoverPackage(
  article: Pick<
    Article,
    "slug" | "title" | "subtitle" | "excerpt" | "category" | "categorySlug" | "tags"
  > & { contentText?: string },
  options?: { forceSeed?: number; publicDir?: string }
): Promise<CoverPackage> {
  const brief = analyzeCoverBrief({
    slug: article.slug,
    title: article.title,
    subtitle: article.subtitle,
    excerpt: article.excerpt,
    contentText: article.contentText,
    category: article.category,
    categorySlug: article.categorySlug,
    tags: article.tags,
    forceSeed: options?.forceSeed,
  });

  const publicDir = options?.publicDir || path.join(process.cwd(), "public");
  const outDir = path.join(publicDir, "images", "covers", article.slug);
  fs.mkdirSync(outDir, { recursive: true });

  const variants = {} as CoverVariants;

  for (const spec of VARIANT_SPECS) {
    const forSocial = spec.key === "og" || spec.key === "twitter" || spec.key === "share";
    const svg = renderCoverSvg(brief, article.title, article.category, {
      width: spec.width,
      height: spec.height,
      showTitle: forSocial,
      showLabels: forSocial,
    });
    const outPath = path.join(outDir, spec.file);
    await sharp(Buffer.from(svg))
      .webp({ quality: 84 })
      .toFile(outPath);
    variants[spec.key] = `/images/covers/${article.slug}/${spec.file}`;
  }

  // Master SVG = arte pura (site cards)
  const masterSvg = renderCoverSvg(brief, article.title, article.category, {
    showTitle: false,
    showLabels: false,
  });
  fs.writeFileSync(path.join(outDir, "master.svg"), masterSvg, "utf-8");

  const copy = metaCopy(brief, article.title, article.category);

  return {
    coverImage: variants.home,
    ...copy,
    coverVariants: variants,
    coverMeta: {
      style: brief.style,
      layout: brief.layout,
      sentiment: brief.sentiment,
      keywords: brief.keywords,
      lighting: brief.lighting,
      motif: brief.motif,
      generatedAt: new Date().toISOString(),
      seed: brief.seed,
      engine: "equilibrio-cover-ai-v1",
    },
  };
}

/* ============================================================
   FOTOGRAFIA REAL (banco gratuito Pexels)
   Substitui a arte abstrata por uma foto real e contextual,
   única por artigo, com tratamento escuro do site.
   ============================================================ */

/** Candidato de foto normalizado (independente da fonte). */
type PhotoCandidate = {
  id: string;
  downloadUrl: string;
  credit: string;
  creditUrl: string;
  source: string;
};

type PexelsPhoto = {
  id: number;
  photographer: string;
  photographer_url: string;
  alt?: string;
  src: { original: string; large2x: string; large: string; landscape: string };
};

type OpenverseImage = {
  id: string;
  title?: string;
  url: string;
  creator?: string;
  creator_url?: string;
  foreign_landing_url?: string;
  tags?: { name: string }[];
};

/** Bloqueia fotos fora do universo do blog (bandeira, política, violência, etc.). */
const PHOTO_BLOCKLIST =
  /\b(flag|bandeira|president|politic|pol[íi]tica|government|governo|protest|war|guerra|militar|military|army|soldier|weapon|gun|arma|election|elei[çc][ãa]o|parliament|senate|minister|congress|nazi|communis|trump|biden|bolsonaro|lula|police|pol[íi]cia|crime|riot|terror|chalkboard|blackboard|whiteboard|signboard|placard|watermark|placeholder|lorem|logo|clipart|screenshot)/i;

function isBlockedPhoto(title?: string, tags?: { name: string }[]): boolean {
  const blob = `${title || ""} ${(tags || []).map((t) => t.name).join(" ")}`;
  return PHOTO_BLOCKLIST.test(blob);
}

/** Busca específica por artigo (lida do tema de cada um). */
const CURATED_QUERIES: Record<string, string> = {
  "5-minutos-de-paz-tecnicas-de-relaxamento-para-quem-tem-a-mente-barulhenta":
    "woman relaxing eyes closed calm",
  "a-conexao-intestino-cerebro-o-eixo-transmissor-da-saude-fisica":
    "healthy food yogurt fresh gut",
  "a-importancia-de-criar-uma-rotina-de-bem-estar-sustentavel":
    "morning wellness routine tea journal",
  "alimentacao-e-bem-estar-como-o-que-voce-come-molda-a-sua-saude-integral":
    "healthy colorful food bowl vegetables",
  "aprendendo-a-dizer-nao-o-limite-que-protege-a-sua-paz-interior":
    "calm confident woman nature",
  "atividade-fisica-na-rotina-o-guia-pratico-para-quem-nao-tem-tempo":
    "person home workout exercise",
  "autocuidado-na-pratica-10-habitos-simples-para-transformar-sua-rotina":
    "self care spa relax candle",
  "como-o-sono-afeta-sua-saude-mental-e-fisica-tudo-que-voce-precisa-saber":
    "woman sleeping peacefully bedroom",
  "criando-o-seu-santuario-em-casa-passos-simples-para-um-cantinho-de-paz":
    "cozy peaceful home plants candles",
  "descomplicando-a-espiritualidade-o-que-ela-tem-a-ver-com-a-sua-paz-de-espirito":
    "meditation sunrise nature peace",
  "desintoxicacao-real-como-apoiar-o-figado-e-os-rins-naturalmente":
    "detox water lemon fresh herbs",
  "detox-digital-e-conexao-real-como-desligar-as-telas-cura-a-alma":
    "reading book relaxing nature",
  "espiritualidade-na-cozinha-o-poder-de-comer-prestando-atencao":
    "mindful eating healthy meal table",
  "estresse-no-dia-a-dia-como-reconhecer-os-sinais-e-agir-antes-que-vire-um-problem":
    "woman relaxing breathing stress relief",
  "gentileza-gera-saude-como-ajudar-o-outro-acalma-o-seu-proprio-coracao":
    "volunteers helping people community",
  "hidratacao-profunda-a-agua-como-purificadora-das-celulas":
    "glass of water hydration fresh",
  "longevidade-o-segredo-para-uma-vida-longa-e-saudavel":
    "happy healthy senior smiling",
  "longevidade-saudavel-habitos-atuais-que-protegem-suas-articulacoes-no-futuro":
    "active senior stretching outdoors",
  "movimento-intuitivo-exercitando-se-por-gratidao-nao-por-punicao":
    "woman yoga stretching outdoors",
  "nutricao-consciente-alimentando-o-corpo-alem-das-calorias":
    "healthy meal fresh vegetables plate",
  "o-diario-da-gratidao-como-um-caderno-simples-pode-mudar-sua-vibracao":
    "gratitude journal writing coffee",
  "o-poder-do-perdao-no-dia-a-dia-tirando-o-carvao-aceso-das-proprias-maos":
    "peaceful woman sunset serene",
  "o-que-e-bem-estar-entenda-o-conceito-e-por-que-ele-importa":
    "woman relaxing wellbeing nature",
  "o-ritmo-do-descanso-a-ciencia-e-a-arte-do-sono-reparador":
    "restful sleep peaceful bedroom",
  "o-templo-fisico-como-a-postura-diaria-afeta-sua-energia-vital":
    "good posture stretching back health",
  "o-templo-fisico-como-a-postura-diaria-afeta-sua-energia-vital-2":
    "stretching spine wellness posture",
  "pe-na-terra-como-o-contato-com-a-natureza-limpa-a-nossa-energia":
    "barefoot walking nature grass",
  "relacoes-saudaveis-como-a-comunicacao-constroi-o-bem-estar":
    "friends talking connection happy",
  "respiracao-diafragmatica-o-santo-graal-da-oxigenacao-celular":
    "woman deep breathing fresh air",
  "saude-mental-cuidando-da-mente-em-tempos-de-incerteza-e-ansiedade":
    "calm mindfulness woman peaceful",
  "sistema-imunologico-blindado-fortalecendo-as-defesas-naturais-do-organismo":
    "healthy citrus fruits vitamin food",
};

/** Consultas de imagem: específica por artigo → motivo → categoria → genérico. */
function buildPhotoQueries(
  brief: CoverBrief,
  categorySlug: string,
  slug: string
): string[] {
  const motifQ: Record<string, string> = {
    "arcos-respiratorios": "woman deep breathing calm",
    "estrutura-articular": "active healthy senior stretching outdoors",
    "lua-e-ondas": "person sleeping peaceful bedroom",
    "formas-organicas": "fresh healthy food and water",
    "halo-contemplativo": "meditation sunrise nature serenity",
    "linhas-mentais": "calm mindfulness relaxation woman",
    "folhas-e-luz": "healthy fresh vegetables cooking",
    "gotas-e-fluxo": "glass of water hydration",
    "silhueta-movimento": "yoga stretching wellness",
    "geometria-vital": "wellness lifestyle serene",
  };
  const catQ: Record<string, string> = {
    "saude-do-corpo": "healthy active lifestyle wellness",
    "saude-da-mente": "calm mindfulness mental wellbeing",
    "saude-espiritual": "meditation serenity nature light",
  };
  const list = [
    CURATED_QUERIES[slug],
    motifQ[brief.motif],
    catQ[categorySlug],
    "wellness serene lifestyle calm",
  ].filter(Boolean) as string[];
  return [...new Set(list)];
}

const FETCH_UA = "Mozilla/5.0 (compatible; equilibrio-cover-bot/1.0)";

/** Pexels (requer PEXELS_API_KEY) → candidatos normalizados. */
async function fetchPexelsCandidates(
  queries: string[],
  apiKey: string
): Promise<PhotoCandidate[]> {
  const seen = new Set<string>();
  const out: PhotoCandidate[] = [];
  for (const q of queries) {
    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(
          q
        )}&orientation=landscape&size=large&per_page=30`,
        { headers: { Authorization: apiKey } }
      );
      if (!res.ok) continue;
      const data = (await res.json()) as { photos?: PexelsPhoto[] };
      for (const p of data.photos || []) {
        const id = String(p.id);
        if (seen.has(id)) continue;
        seen.add(id);
        out.push({
          id,
          downloadUrl: p.src.large2x || p.src.original || p.src.large,
          credit: p.photographer || "",
          creditUrl: p.photographer_url || "",
          source: "Pexels",
        });
      }
      if (out.length >= 24) break;
    } catch {
      /* tenta a próxima consulta */
    }
  }
  return out;
}

/** Uma passada de busca no Openverse (opcionalmente restrita a fontes). */
async function openverseSearch(
  queries: string[],
  sources: string,
  seen: Set<string>,
  out: PhotoCandidate[]
): Promise<void> {
  for (const q of queries) {
    if (out.length >= 24) return;
    try {
      const params = new URLSearchParams({
        q,
        license_type: "commercial",
        mature: "false",
        page_size: "20",
      });
      if (sources) params.set("source", sources);
      const res = await fetch(`https://api.openverse.org/v1/images/?${params.toString()}`, {
        headers: { "User-Agent": FETCH_UA, Accept: "application/json" },
      });
      if (!res.ok) continue;
      const data = (await res.json()) as { results?: OpenverseImage[] };
      for (const r of data.results || []) {
        if (!r.url || seen.has(r.id)) continue;
        if (isBlockedPhoto(r.title, r.tags)) continue; // sem bandeira/política/violência
        seen.add(r.id);
        out.push({
          id: r.id,
          downloadUrl: r.url,
          credit: r.creator || "",
          creditUrl: r.foreign_landing_url || r.creator_url || "",
          source: "Openverse",
        });
      }
    } catch {
      /* tenta a próxima consulta */
    }
  }
}

/**
 * Openverse (SEM chave) → candidatos normalizados.
 * 1) fontes de fotos profissionais (StockSnap/Rawpixel/Nappy) — limpas e no tema;
 * 2) só se faltar, amplia para todas as fontes (ainda com bloqueio de política).
 */
async function fetchOpenverseCandidates(queries: string[]): Promise<PhotoCandidate[]> {
  const seen = new Set<string>();
  const out: PhotoCandidate[] = [];
  // 1) fotos profissionais limpas
  await openverseSearch(queries, "stocksnap,rawpixel,nappy", seen, out);
  // 2) só se faltar, amplia para fontes FOTOGRÁFICAS (Flickr dá volume/tema);
  //    evita de propósito museus/Wikimedia/SVG que trazem bandeira/política/ícones.
  if (out.length < 6) {
    await openverseSearch(queries, "flickr,stocksnap,rawpixel,nappy,wordpress", seen, out);
  }
  return out;
}

/** Baixa a imagem com User-Agent (alguns CDNs rejeitam sem UA). */
async function downloadImage(url: string): Promise<Buffer> {
  const res = await fetch(url, { headers: { "User-Agent": FETCH_UA } });
  if (!res.ok) throw new Error(`download ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/**
 * Garante que é uma FOTO de verdade e utilizável:
 * formato raster, tamanho mínimo e variação de cor suficiente
 * (descarta SVG, ícones, placeholders e imagens quase sólidas).
 */
async function isUsablePhoto(buf: Buffer): Promise<boolean> {
  try {
    const meta = await sharp(buf).metadata();
    const fmt = meta.format || "";
    if (!["jpeg", "jpg", "png", "webp", "avif", "tiff"].includes(fmt)) return false;
    if (!meta.width || !meta.height || meta.width < 600 || meta.height < 400) return false;
    const stats = await sharp(buf).stats();
    const avgStd =
      stats.channels.reduce((s, c) => s + c.stdev, 0) / (stats.channels.length || 1);
    if (avgStd < 14) return false; // quase sólida (placeholder/silhueta)
    return true;
  } catch {
    return false;
  }
}

/** Camada transparente: leve tint azul-marinho + gradiente para leitura. */
function renderPhotoOverlaySvg(
  brief: CoverBrief,
  title: string,
  category: string,
  opts?: { width?: number; height?: number; showTitle?: boolean; showLabels?: boolean }
): string {
  const w = opts?.width ?? 1600;
  const h = opts?.height ?? 900;
  const showTitle = opts?.showTitle === true;
  const showLabels = opts?.showLabels === true || showTitle;
  const lines = wrapTitle(title, 32);
  const titleSize = Math.max(30, Math.round(Math.min(w, h) * 0.05));
  const padX = Math.round(w * 0.07);
  const firstLineY = h - Math.round(h * 0.11) - (lines.length - 1) * (titleSize + 10);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0A2540" stop-opacity="0"/>
      <stop offset="55%" stop-color="#0A2540" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#0A2540" stop-opacity="${showTitle ? 0.92 : 0.7}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#0A2540" opacity="0.16"/>
  <rect width="${w}" height="${h}" fill="url(#scrim)"/>
  ${
    showLabels
      ? `<text x="${padX}" y="${firstLineY - titleSize - 18}" fill="#E8C47C" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="${Math.round(
          h * 0.028
        )}" letter-spacing="3.5" font-weight="600">${escapeXml(category.toUpperCase())}</text>`
      : ""
  }
  ${
    showTitle
      ? lines
          .map(
            (line, i) =>
              `<text x="${padX}" y="${firstLineY + i * (titleSize + 10)}" fill="#F7F4EF" font-family="Georgia, 'Times New Roman', serif" font-size="${titleSize}" font-weight="700">${escapeXml(
                line
              )}</text>`
          )
          .join("\n  ")
      : ""
  }
</svg>`;
}

async function generatePhotoCoverPackage(
  article: Pick<
    Article,
    "slug" | "title" | "subtitle" | "excerpt" | "category" | "categorySlug" | "tags"
  > & { contentText?: string },
  brief: CoverBrief,
  candidates: PhotoCandidate[],
  options?: { forceSeed?: number; publicDir?: string }
): Promise<CoverPackage> {
  if (!candidates.length) throw new Error("Sem candidatos de foto");

  const publicDir = options?.publicDir || path.join(process.cwd(), "public");
  const projectRoot = path.dirname(publicDir);
  const mapPath = path.join(projectRoot, "content", "data", "cover-photos.json");

  let photoMap: Record<string, string> = {};
  try {
    photoMap = JSON.parse(fs.readFileSync(mapPath, "utf-8"));
  } catch {
    photoMap = {};
  }
  // Na Vercel o disco é somente leitura e não guardamos imagens: a capa usa a URL
  // da própria foto (Pexels/Openverse). Evita repetir fotos já usadas por outros artigos.
  const remoteMode = Boolean(process.env.VERCEL);
  const usedUrls = new Set<string>();
  if (remoteMode) {
    for (const a of await loadAllArticles()) {
      if (a.slug !== article.slug && /^https?:/.test(a.coverImage || "")) usedUrls.add(a.coverImage);
    }
  }
  // forceSeed = "gerar nova capa": também evita repetir a foto atual deste artigo
  const usedByOthers = new Set(
    Object.entries(photoMap)
      .filter(([slug]) => slug !== article.slug || options?.forceSeed !== undefined)
      .map(([, id]) => String(id))
  );

  // Prioriza os candidatos da consulta mais específica (o "motivo" do artigo,
  // que vem primeiro) e que ainda não foram usados em outro artigo — mantém a
  // relação com o tema e garante unicidade. Baixa o 1º que funcionar.
  const isUsed = (c: PhotoCandidate) => usedByOthers.has(c.id) || usedUrls.has(c.downloadUrl);
  const ordered = [...candidates.filter((c) => !isUsed(c)), ...candidates.filter(isUsed)];

  let chosen: PhotoCandidate | null = null;
  let photoBuffer: Buffer | null = null;
  for (const cand of ordered) {
    try {
      const buf = await downloadImage(cand.downloadUrl);
      if (!(await isUsablePhoto(buf))) continue; // descarta SVG/placeholder/quase sólida
      photoBuffer = buf;
      chosen = cand;
      break;
    } catch {
      /* tenta o próximo candidato */
    }
  }
  if (!chosen || !photoBuffer) throw new Error("Nenhuma foto utilizável pôde ser baixada");

  if (remoteMode) {
    // Foto baixada só para validar; descartada. Nada é gravado.
    const url = chosen.downloadUrl;
    const kwRemote = brief.keywords.slice(0, 4).join(", ");
    const creditRemote = chosen.credit
      ? `Foto: ${chosen.credit} / ${chosen.source}`
      : `Foto: ${chosen.source}`;
    return {
      coverImage: url,
      coverAlt: `${article.title} — fotografia editorial sobre ${article.category}${
        kwRemote ? `, relacionada a ${kwRemote}` : ""
      }`,
      coverCaption: creditRemote,
      coverDescription: `Fotografia real selecionada para o tema do artigo (${article.category}). ${creditRemote}.`,
      coverVariants: { featured: url, og: url, twitter: url, thumb: url, home: url, share: url },
      coverMeta: {
        style: "Fotografia Realista",
        layout: brief.layout,
        sentiment: brief.sentiment,
        keywords: brief.keywords,
        lighting: brief.lighting,
        motif: brief.motif,
        generatedAt: new Date().toISOString(),
        seed: brief.seed,
        engine: "equilibrio-cover-photo-remote-v1",
        credit: chosen.credit,
        creditUrl: chosen.creditUrl,
        source: chosen.source,
      },
    };
  }

  const outDir = path.join(publicDir, "images", "covers", article.slug);
  fs.mkdirSync(outDir, { recursive: true });

  const variants = {} as CoverVariants;
  for (const spec of VARIANT_SPECS) {
    const forSocial = spec.key === "og" || spec.key === "twitter" || spec.key === "share";
    const overlay = Buffer.from(
      renderPhotoOverlaySvg(brief, article.title, article.category, {
        width: spec.width,
        height: spec.height,
        showTitle: forSocial,
        showLabels: forSocial,
      })
    );
    const outPath = path.join(outDir, spec.file);
    await sharp(photoBuffer)
      .resize(spec.width, spec.height, { fit: "cover", position: "attention" })
      .modulate({ saturation: 0.9, brightness: 0.98 })
      .composite([{ input: overlay, top: 0, left: 0 }])
      .webp({ quality: 82 })
      .toFile(outPath);
    variants[spec.key] = `/images/covers/${article.slug}/${spec.file}`;
  }

  // Master (arte de referência) — foto tratada, sem texto.
  const masterOverlay = Buffer.from(
    renderPhotoOverlaySvg(brief, article.title, article.category, {
      width: 1600,
      height: 900,
      showTitle: false,
      showLabels: false,
    })
  );
  await sharp(photoBuffer)
    .resize(1600, 900, { fit: "cover", position: "attention" })
    .modulate({ saturation: 0.9, brightness: 0.98 })
    .composite([{ input: masterOverlay, top: 0, left: 0 }])
    .webp({ quality: 84 })
    .toFile(path.join(outDir, "master.webp"));

  // Persiste a foto usada (garante unicidade entre artigos).
  photoMap[article.slug] = chosen.id;
  try {
    fs.mkdirSync(path.dirname(mapPath), { recursive: true });
    fs.writeFileSync(mapPath, JSON.stringify(photoMap, null, 2), "utf-8");
  } catch {
    /* não bloqueia a geração */
  }

  const kw = brief.keywords.slice(0, 4).join(", ");
  const coverAlt = `${article.title} — fotografia editorial sobre ${article.category}${
    kw ? `, relacionada a ${kw}` : ""
  }`;
  const credit = chosen.credit
    ? `Foto: ${chosen.credit} / ${chosen.source}`
    : `Foto: ${chosen.source}`;

  return {
    coverImage: variants.home,
    coverAlt,
    coverCaption: credit,
    coverDescription: `Fotografia real selecionada para o tema do artigo (${article.category}). ${credit}.`,
    coverVariants: variants,
    coverMeta: {
      style: "Fotografia Realista",
      layout: brief.layout,
      sentiment: brief.sentiment,
      keywords: brief.keywords,
      lighting: brief.lighting,
      motif: brief.motif,
      generatedAt: new Date().toISOString(),
      seed: brief.seed,
      engine: "equilibrio-cover-photo-v1",
      credit: chosen.credit,
      creditUrl: chosen.creditUrl,
      source: chosen.source,
    },
  };
}

/**
 * Gera a capa do artigo com FOTOGRAFIA REAL e contextual.
 * Fontes, em ordem: Pexels (se houver PEXELS_API_KEY) → Openverse (sem chave).
 * Se nenhuma foto puder ser obtida, cai na arte gerada (nunca quebra).
 */
export async function generateCoverPackage(
  article: Pick<
    Article,
    "slug" | "title" | "subtitle" | "excerpt" | "category" | "categorySlug" | "tags"
  > & { contentText?: string },
  options?: { forceSeed?: number; publicDir?: string; reasonOut?: { reason?: string } }
): Promise<CoverPackage> {
  const brief = analyzeCoverBrief({
    slug: article.slug,
    title: article.title,
    subtitle: article.subtitle,
    excerpt: article.excerpt,
    contentText: article.contentText,
    category: article.category,
    categorySlug: article.categorySlug,
    tags: article.tags,
    forceSeed: options?.forceSeed,
  });
  const queries = buildPhotoQueries(brief, article.categorySlug || "", article.slug);

  try {
    const apiKey = (process.env.PEXELS_API_KEY || "").trim();
    let candidates: PhotoCandidate[] = [];
    if (apiKey) candidates = await fetchPexelsCandidates(queries, apiKey);
    if (!candidates.length) candidates = await fetchOpenverseCandidates(queries);
    if (candidates.length) {
      return await generatePhotoCoverPackage(article, brief, candidates, options);
    }
    if (options?.reasonOut) {
      options.reasonOut.reason = "Nenhuma foto adequada ao tema foi encontrada nos bancos de imagens.";
    }
    console.warn(`[cover] Sem fotos para "${article.slug}". Usando arte de fallback.`);
  } catch (err) {
    if (options?.reasonOut) {
      options.reasonOut.reason = `Não consegui buscar ou baixar a foto (${(err as Error).message}).`;
    }
    console.warn(
      `[cover] Foto real indisponível para "${article.slug}" (${
        (err as Error).message
      }). Usando arte de fallback.`
    );
  }
  return generateArtCoverPackage(article, options);
}

/** Corta no fim de uma frase (ou, na falta, de uma palavra) sem deixar vírgula solta no final. */
function clipText(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const head = t.slice(0, max);
  const sentenceEnd = Math.max(head.lastIndexOf(". "), head.lastIndexOf("! "), head.lastIndexOf("? "));
  if (sentenceEnd >= Math.floor(max * 0.5)) return head.slice(0, sentenceEnd + 1).trim();
  const lastSpace = head.lastIndexOf(" ");
  const cut = (lastSpace > 0 ? head.slice(0, lastSpace) : head).replace(/[\s,;:–—-]+$/, "");
  return `${cut}…`;
}

export function buildSeoFromArticle(input: {
  title: string;
  subtitle?: string;
  excerpt?: string;
  contentText?: string;
  tags?: string[];
  category?: string;
  siteName?: string;
}) {
  const siteName = input.siteName || "SAÚDE INTEGRAL";
  const text = (input.contentText || input.excerpt || "").replace(/\s+/g, " ").trim();
  const summary =
    input.excerpt?.trim() ||
    clipText(text, 220) ||
    input.subtitle ||
    input.title;
  const metaDescription = clipText(input.subtitle || summary, 158);
  const keywords = extractKeywords(
    `${input.title} ${input.subtitle || ""} ${text} ${(input.tags || []).join(" ")} ${input.category || ""}`,
    input.tags || []
  );
  return {
    // o layout já acrescenta " | SAÚDE INTEGRAL" via title.template
    seoTitle: input.title,
    metaDescription,
    keywords,
    summary: clipText(summary, 280),
    coverAlt: `Capa do artigo “${input.title}” no portal ${siteName}`,
  };
}
