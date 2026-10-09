"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Article } from "@/lib/types";
import { siteConfig } from "@/lib/site";

function htmlToEditable(html: string) {
  return html
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "\n\n## $1\n\n")
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "\n\n### $1\n\n")
    .replace(/<aside[\s\S]*?<\/aside>/gi, (block) => {
      const text = block.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      return `\n\n## A Dica de Ouro\n\n${text}\n\n`;
    })
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n\n$1\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

type AiKind = "cover" | "seo" | "meta" | "keywords" | "summary";

type PanelAction = { label: string; onClick: () => void };
type Panel = {
  state: "running" | "ok" | "warn" | "error";
  title: string;
  message?: string;
  detail?: string;
  preview?: string;
  actions?: PanelAction[];
};

type CoverPack = {
  coverImage: string;
  coverAlt?: string;
  coverCaption?: string;
  coverDescription?: string;
  coverVariants?: Article["coverVariants"];
  coverMeta?: Article["coverMeta"];
};

const AI_LABEL: Record<AiKind, string> = {
  cover: "a capa",
  seo: "o título e a descrição SEO",
  meta: "a meta descrição",
  keywords: "as palavras-chave",
  summary: "o resumo",
};

const MIN_TEXT = 80;

async function callApi<T>(url: string, body: unknown): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 58_000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(
        data?.error ||
          (res.status === 401
            ? "Sua sessão expirou. Entre novamente no painel."
            : `O servidor respondeu com erro (código ${res.status}).`)
      );
    }
    return data as T;
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      throw new Error("A geração demorou mais de 1 minuto e foi interrompida.");
    }
    if (e instanceof TypeError) throw new Error("Sem conexão com o servidor.");
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export function ArticleEditor({ article }: { article?: Article }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<"idle" | "saving">("idle");
  const [busyKind, setBusyKind] = useState<AiKind | null>(null);
  const [error, setError] = useState("");
  const [coverPreview, setCoverPreview] = useState(article?.coverImage || "");
  const [coverPack, setCoverPack] = useState<CoverPack | null>(null);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [stamp] = useState(() => Date.now());

  const field = (name: string) =>
    formRef.current?.elements.namedItem(name) as
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
      | null;
  const val = (name: string) => (field(name)?.value || "").trim();
  const setVal = (name: string, value: string) => {
    const el = field(name);
    if (el) el.value = value;
  };
  const focusField = (name: string) => {
    const el = field(name);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.focus();
  };

  function autoCoverUrl() {
    const slug = article?.slug || val("title").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60) || "artigo";
    return `/api/cover-art?slug=${encodeURIComponent(slug)}&title=${encodeURIComponent(
      val("title")
    )}&cat=${encodeURIComponent(val("categorySlug") || "saude-da-mente")}`;
  }

  function applyAutoCover() {
    const url = autoCoverUrl();
    setVal("coverImage", url);
    setCoverPreview(url);
    setCoverPack(null);
    setPanel({
      state: "ok",
      title: "✓ Arte automática aplicada",
      message:
        "Usei a arte editorial do site como capa. Clique em Publicar para salvar. Você pode gerar uma foto depois.",
      preview: url,
    });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    setError("");
    const form = new FormData(e.currentTarget);
    const tagList = String(form.get("tags") || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const seoTitle = String(form.get("seoTitle") || "").trim();
    const seoDescription = String(form.get("seoDescription") || "").trim();

    const payload = {
      slug: article?.slug,
      title: String(form.get("title") || ""),
      subtitle: String(form.get("subtitle") || ""),
      excerpt: String(form.get("excerpt") || ""),
      content: String(form.get("content") || ""),
      author: String(form.get("author") || siteConfig.author),
      category: String(form.get("category") || "Saúde da Mente"),
      categorySlug: String(form.get("categorySlug") || "saude-da-mente"),
      tags: String(form.get("tags") || ""),
      coverImage: String(form.get("coverImage") || ""),
      ...(coverPack
        ? {
            coverAlt: coverPack.coverAlt,
            coverCaption: coverPack.coverCaption,
            coverDescription: coverPack.coverDescription,
            coverVariants: coverPack.coverVariants,
            coverMeta: coverPack.coverMeta,
          }
        : {}),
      ...(seoTitle || seoDescription
        ? {
            seo: {
              title: seoTitle || String(form.get("title") || ""),
              description: seoDescription,
              keywords: tagList,
            },
          }
        : {}),
      audioUrl: String(form.get("audioUrl") || ""),
      goldTip: String(form.get("goldTip") || ""),
      status: String(form.get("status") || "published"),
      scheduledFor: String(form.get("scheduledFor") || "") || undefined,
      publishedAt: String(form.get("publishedAt") || "") || undefined,
      autoCover: true,
      autoSeo: true,
    };

    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("idle");
        setError(data.error || `Erro ao salvar (código ${res.status}). Tente novamente.`);
        return;
      }
    } catch {
      setStatus("idle");
      setError("Sem conexão com o servidor. Seu texto continua na tela — tente novamente.");
      return;
    }
    router.push("/admin/artigos");
    router.refresh();
  }

  async function onDelete() {
    if (!article?.slug) return;
    if (!confirm("Excluir este artigo?")) return;
    setError("");
    try {
      const res = await fetch(`/api/articles?slug=${encodeURIComponent(article.slug)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Não foi possível excluir (código ${res.status}).`);
        return;
      }
    } catch {
      setError("Sem conexão com o servidor. O artigo não foi excluído.");
      return;
    }
    router.push("/admin/artigos");
    router.refresh();
  }

  function fail(kind: AiKind, message: string, opts?: { focus?: string; detail?: string }) {
    const actions: PanelAction[] = [];
    if (opts?.focus) {
      const target = opts.focus;
      actions.push({ label: "Ir para o campo", onClick: () => focusField(target) });
    } else {
      actions.push({ label: "Tentar novamente", onClick: () => runAi(kind) });
      if (kind === "cover") {
        actions.push({ label: "Usar a arte automática do site", onClick: applyAutoCover });
        actions.push({ label: "Colar o endereço de uma imagem", onClick: () => focusField("coverImage") });
      } else {
        const target = kind === "keywords" ? "tags" : kind === "summary" ? "excerpt" : kind === "meta" ? "seoDescription" : "seoTitle";
        actions.push({ label: "Preencher manualmente", onClick: () => focusField(target) });
      }
    }
    setPanel({
      state: "error",
      title: `✗ Não foi possível gerar ${AI_LABEL[kind]}`,
      message,
      detail: opts?.detail,
      actions,
    });
  }

  async function runAi(kind: AiKind) {
    if (busyKind) return;
    const title = val("title");
    const content = val("content");

    if (!title) {
      fail(kind, "Falta o título. A geração usa o título e o texto do artigo.", { focus: "title" });
      return;
    }
    if (kind !== "cover" && content.length < MIN_TEXT) {
      fail(kind, `Escreva um pouco mais no campo Conteúdo (pelo menos ${MIN_TEXT} caracteres) para a geração ter o que analisar.`, {
        focus: "content",
      });
      return;
    }

    setBusyKind(kind);
    setPanel({
      state: "running",
      title: `Gerando ${AI_LABEL[kind]}…`,
      message: kind === "cover" ? "Buscando uma foto ligada ao tema. Pode levar até 30 segundos." : "Analisando o texto.",
    });

    const base = {
      slug: article?.slug,
      title,
      subtitle: val("subtitle"),
      excerpt: val("excerpt"),
      content,
      tags: val("tags"),
      category: val("category"),
      categorySlug: val("categorySlug"),
    };

    try {
      if (kind === "cover") {
        const data = await callApi<{
          cover: CoverPack;
          fallback?: boolean;
          reason?: string;
        }>("/api/ai/cover", { ...base, forceNew: true });
        const cover = data.cover;
        setVal("coverImage", cover.coverImage);
        setCoverPreview(cover.coverImage);
        setCoverPack(cover);
        if (data.fallback) {
          setPanel({
            state: "warn",
            title: "⚠ Capa gerada com a arte automática do site",
            message: `${data.reason || "Não foi possível obter uma foto para este tema."} Aplicada ao formulário — clique em Publicar para salvar.`,
            preview: cover.coverImage,
            actions: [
              { label: "Tentar outra foto", onClick: () => runAi("cover") },
              { label: "Colar o endereço de uma imagem", onClick: () => focusField("coverImage") },
            ],
          });
        } else {
          setPanel({
            state: "ok",
            title: "✓ Capa gerada",
            message: `${cover.coverCaption || "Foto relacionada ao tema"}. Aplicada ao formulário — clique em Publicar para salvar.`,
            preview: cover.coverImage,
            actions: [{ label: "Gerar outra foto", onClick: () => runAi("cover") }],
          });
        }
        return;
      }

      const data = await callApi<{
        seoTitle?: string;
        metaDescription?: string;
        keywords?: string[];
        summary?: string;
      }>("/api/ai/seo", { ...base, mode: kind });

      const filled: string[] = [];
      if ((kind === "seo") && data.seoTitle) {
        setVal("seoTitle", data.seoTitle);
        filled.push("Título SEO");
      }
      if ((kind === "seo" || kind === "meta") && data.metaDescription) {
        setVal("seoDescription", data.metaDescription);
        filled.push("Descrição SEO");
      }
      if (kind === "keywords" && data.keywords?.length) {
        setVal("tags", data.keywords.join(", "));
        filled.push("Tags");
      }
      if (kind === "summary" && data.summary) {
        setVal("excerpt", data.summary);
        filled.push("Resumo");
      }
      if (!filled.length) {
        fail(kind, "A análise não encontrou conteúdo suficiente para sugerir algo. Tente detalhar mais o texto.", {
          detail: "Resposta vazia do servidor.",
        });
        return;
      }
      setPanel({
        state: "ok",
        title: `✓ ${filled.join(" e ")} ${filled.length > 1 ? "gerados" : "gerado"}`,
        message: "Preenchido no formulário — revise e clique em Publicar para salvar.",
        actions: [{ label: "Gerar de novo", onClick: () => runAi(kind) }],
      });
    } catch (e) {
      fail(kind, e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setBusyKind(null);
    }
  }

  const contentDefault = article?.content
    ? htmlToEditable(article.content)
    : article?.contentText || "";

  const previewSrc = coverPreview
    ? coverPreview.includes("?")
      ? coverPreview
      : `${coverPreview}?t=${stamp}`
    : "";

  const aiButton = (kind: AiKind, label: string) => (
    <button
      className={`btn btn--outline${busyKind === kind ? " is-busy" : ""}`}
      type="button"
      onClick={() => runAi(kind)}
      disabled={Boolean(busyKind)}
      aria-busy={busyKind === kind}
    >
      {busyKind === kind && <span className="ai-spinner" aria-hidden="true" />}
      {busyKind === kind ? "Gerando…" : label}
    </button>
  );

  return (
    <form className="admin-form admin-card" onSubmit={onSubmit} ref={formRef}>
      <h1 style={{ fontFamily: "var(--font-serif)", marginTop: 0 }}>
        {article ? "Editar artigo" : "Novo artigo"}
      </h1>
      <p style={{ color: "var(--text-muted)", marginTop: 0 }}>
        Escreva o texto e clique em <strong>Publicar</strong>. A capa, o SEO, o texto alternativo e os
        metadados são gerados automaticamente — ou use os botões abaixo para gerar e revisar antes.
      </p>

      <div className="admin-ai-bar">
        {aiButton("cover", "Gerar nova capa com IA")}
        {aiButton("seo", "Gerar título e descrição SEO")}
        {aiButton("meta", "Gerar meta descrição")}
        {aiButton("keywords", "Gerar palavras-chave")}
        {aiButton("summary", "Gerar resumo")}
      </div>

      {panel && (
        <div className={`ai-panel ai-panel--${panel.state}`} role="status" aria-live="polite">
          <div className="ai-panel__head">
            {panel.state === "running" && <span className="ai-spinner" aria-hidden="true" />}
            <strong>{panel.title}</strong>
            {panel.state !== "running" && (
              <button type="button" className="ai-panel__close" onClick={() => setPanel(null)} aria-label="Fechar aviso">
                ×
              </button>
            )}
          </div>
          {panel.message && <p>{panel.message}</p>}
          {panel.detail && <p className="ai-panel__detail">Detalhe técnico: {panel.detail}</p>}
          {panel.preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={panel.preview} alt="Prévia da capa gerada" className="ai-panel__preview" />
          )}
          {panel.actions && panel.actions.length > 0 && (
            <div className="ai-panel__actions">
              {panel.actions.map((a) => (
                <button key={a.label} type="button" className="btn btn--outline" onClick={a.onClick}>
                  {a.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {previewSrc && !panel?.preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewSrc}
          alt={article?.coverAlt || "Prévia da capa"}
          style={{ width: "100%", maxHeight: 280, objectFit: "cover", borderRadius: 12, marginBottom: "1rem" }}
        />
      )}

      <label>
        Título
        <input name="title" required defaultValue={article?.title} />
      </label>
      <label>
        Subtítulo
        <input name="subtitle" defaultValue={article?.subtitle} />
      </label>
      <label>
        Resumo
        <textarea name="excerpt" rows={3} defaultValue={article?.excerpt} />
      </label>
      <label>
        Conteúdo
        <textarea name="content" rows={18} required defaultValue={contentDefault} />
      </label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.9rem" }}>
        <label>
          Autor
          <input name="author" defaultValue={article?.author || siteConfig.author} />
        </label>
        <label>
          Situação
          <select name="status" defaultValue={article?.status || "published"}>
            <option value="published">Publicado</option>
            <option value="draft">Rascunho</option>
            <option value="scheduled">Agendado</option>
          </select>
        </label>
        <label>
          Categoria
          <select name="category" defaultValue={article?.category || "Saúde da Mente"}>
            <option value="Saúde do Corpo">Saúde do Corpo</option>
            <option value="Saúde da Mente">Saúde da Mente</option>
            <option value="Saúde Espiritual">Saúde Espiritual</option>
          </select>
        </label>
        <label>
          Slug da categoria
          <select name="categorySlug" defaultValue={article?.categorySlug || "saude-da-mente"}>
            <option value="saude-do-corpo">saude-do-corpo</option>
            <option value="saude-da-mente">saude-da-mente</option>
            <option value="saude-espiritual">saude-espiritual</option>
          </select>
        </label>
        <label>
          Etiquetas (separadas por vírgula)
          <input name="tags" defaultValue={article?.tags?.join(", ")} />
        </label>
        <label>
          Data de publicação
          <input
            type="date"
            name="publishedAt"
            defaultValue={article?.publishedAt?.slice(0, 10)}
          />
        </label>
        <label>
          Agendar para
          <input
            type="datetime-local"
            name="scheduledFor"
            defaultValue={article?.scheduledFor?.slice(0, 16)}
          />
        </label>
        <label>
          Imagem de capa (endereço)
          <input
            name="coverImage"
            defaultValue={article?.coverImage || ""}
            onChange={(e) => {
              setCoverPreview(e.target.value);
              setCoverPack(null);
            }}
          />
        </label>
        <label>
          Título SEO (aparece no Google)
          <input name="seoTitle" defaultValue={article?.seo?.title || ""} maxLength={120} />
        </label>
        <label>
          Descrição SEO (meta descrição)
          <textarea name="seoDescription" rows={2} defaultValue={article?.seo?.description || ""} maxLength={320} />
        </label>
        <label>
          Áudio do artigo (endereço mp3/m4a)
          <input
            name="audioUrl"
            placeholder="https://... ou /audio/artigo.mp3"
            defaultValue={article?.audioUrl || ""}
          />
        </label>
        <label>
          Dica de Ouro (lateral)
          <input
            name="goldTip"
            placeholder="Resumo curto da dica para a lateral"
            defaultValue={article?.goldTip || ""}
          />
        </label>
      </div>

      {error && (
        <p role="alert" style={{ color: "#b42318" }}>
          {error}
        </p>
      )}

      <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
        <button className="btn btn--primary" type="submit" disabled={status === "saving" || Boolean(busyKind)}>
          {status === "saving" ? "Publicando..." : "Publicar"}
        </button>
        {article && (
          <button className="btn btn--outline" type="button" onClick={onDelete}>
            Excluir
          </button>
        )}
      </div>
    </form>
  );
}
