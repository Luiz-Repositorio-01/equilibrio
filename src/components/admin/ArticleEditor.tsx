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

export function ArticleEditor({ article }: { article?: Article }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "ai">("idle");
  const [error, setError] = useState("");
  const [coverPreview, setCoverPreview] = useState(article?.coverImage || "");
  const [aiNote, setAiNote] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    setError("");
    const form = new FormData(e.currentTarget);
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
      audioUrl: String(form.get("audioUrl") || ""),
      goldTip: String(form.get("goldTip") || ""),
      status: String(form.get("status") || "published"),
      featured: form.get("featured") === "on",
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
        setStatus("error");
        setError(data.error || `Erro ao salvar (HTTP ${res.status}). Tente novamente.`);
        return;
      }
    } catch {
      setStatus("error");
      setError("Sem conexão com o servidor. Seu texto continua na tela — tente novamente.");
      return;
    }
    router.push("/admin/artigos");
    router.refresh();
  }

  async function onDelete() {
    if (!article?.slug) return;
    if (!confirm("Excluir este artigo?")) return;
    await fetch(`/api/articles?slug=${encodeURIComponent(article.slug)}`, {
      method: "DELETE",
    });
    router.push("/admin/artigos");
    router.refresh();
  }

  async function runAi(action: string) {
    if (!article?.slug && action === "cover") {
      setError("Salve o artigo primeiro para gerar a capa com IA.");
      return;
    }
    setStatus("ai");
    setError("");
    setAiNote("");

    try {
      if (action === "cover") {
        const res = await fetch("/api/ai/cover", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: article!.slug, forceNew: true }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Falha na capa");
        setCoverPreview(data.cover?.coverImage || data.article?.coverImage);
        const input = formRef.current?.elements.namedItem("coverImage") as HTMLInputElement | null;
        if (input) input.value = data.cover?.coverImage || "";
        setAiNote(
          `Capa gerada: ${data.cover?.coverCaption || data.cover?.coverMeta?.source || "arte editorial"}`
        );
        router.refresh();
        return;
      }

      const form = formRef.current;
      const modeMap: Record<string, string> = {
        seo: "seo",
        meta: "meta",
        keywords: "keywords",
        summary: "summary",
      };
      const res = await fetch("/api/ai/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: article?.slug,
          persist: Boolean(article?.slug),
          mode: modeMap[action] || "all",
          title: (form?.elements.namedItem("title") as HTMLInputElement)?.value,
          subtitle: (form?.elements.namedItem("subtitle") as HTMLInputElement)?.value,
          excerpt: (form?.elements.namedItem("excerpt") as HTMLTextAreaElement)?.value,
          content: (form?.elements.namedItem("content") as HTMLTextAreaElement)?.value,
          tags: (form?.elements.namedItem("tags") as HTMLInputElement)?.value,
          category: (form?.elements.namedItem("category") as HTMLSelectElement)?.value,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha na IA SEO");

      if (data.summary && form) {
        const excerpt = form.elements.namedItem("excerpt") as HTMLTextAreaElement;
        if (excerpt) excerpt.value = data.summary;
      }
      if (data.keywords && form) {
        const tags = form.elements.namedItem("tags") as HTMLInputElement;
        if (tags) tags.value = (data.keywords as string[]).join(", ");
      }
      setAiNote(
        action === "meta"
          ? `Meta description: ${data.metaDescription}`
          : action === "keywords"
            ? `Palavras-chave: ${(data.keywords || []).join(", ")}`
            : action === "summary"
              ? "Resumo gerado e aplicado."
              : "SEO completo gerado."
      );
      if (article?.slug) router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro na IA");
    } finally {
      setStatus("idle");
    }
  }

  const contentDefault = article?.content
    ? htmlToEditable(article.content)
    : article?.contentText || "";

  return (
    <form className="admin-form admin-card" onSubmit={onSubmit} ref={formRef}>
      <h1 style={{ fontFamily: "var(--font-serif)", marginTop: 0 }}>
        {article ? "Editar artigo" : "Novo artigo"}
      </h1>
      <p style={{ color: "var(--text-muted)", marginTop: 0 }}>
        Escreva o texto e clique em <strong>Publicar</strong>. A IA gera capa exclusiva, SEO,
        ALT, Open Graph e metadados automaticamente.
      </p>

      <div className="admin-ai-bar">
        <button className="btn btn--outline" type="button" onClick={() => runAi("cover")} disabled={status === "ai"}>
          Gerar nova capa com IA
        </button>
        <button className="btn btn--outline" type="button" onClick={() => runAi("seo")} disabled={status === "ai"}>
          Gerar descrição SEO
        </button>
        <button className="btn btn--outline" type="button" onClick={() => runAi("meta")} disabled={status === "ai"}>
          Gerar meta description
        </button>
        <button className="btn btn--outline" type="button" onClick={() => runAi("keywords")} disabled={status === "ai"}>
          Gerar palavras-chave
        </button>
        <button className="btn btn--outline" type="button" onClick={() => runAi("summary")} disabled={status === "ai"}>
          Gerar resumo
        </button>
      </div>
      {aiNote && <p style={{ color: "var(--gold, #C9A96E)", marginTop: 0 }}>{aiNote}</p>}
      {coverPreview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`${coverPreview}?t=${Date.now()}`}
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
          Status
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
          Tags (separadas por vírgula)
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
          Imagem de capa (URL)
          <input
            name="coverImage"
            defaultValue={article?.coverImage || ""}
            onChange={(e) => setCoverPreview(e.target.value)}
          />
        </label>
        <label>
          Áudio do artigo (URL mp3/m4a)
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
            placeholder="Resumo curto da dica para a sidebar"
            defaultValue={article?.goldTip || ""}
          />
        </label>
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <input type="checkbox" name="featured" defaultChecked={article?.featured} />
        Artigo em destaque
      </label>

      {error && <p style={{ color: "#b42318" }}>{error}</p>}

      <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
        <button className="btn btn--primary" type="submit" disabled={status === "saving" || status === "ai"}>
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
