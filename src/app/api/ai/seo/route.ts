import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getArticleAdmin } from "@/lib/cms";
import { buildSeoFromArticle } from "@/lib/cover-ai";
import { siteConfig } from "@/lib/site";

/**
 * Sugere título SEO, meta descrição, palavras-chave e resumo a partir do texto do formulário.
 * NÃO salva nada: o editor preenche os campos e o artigo só muda ao Publicar.
 */
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json(
      { error: "Sua sessão expirou. Entre novamente no painel." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const mode = String(body.mode || "all");
    const existing = body.slug ? await getArticleAdmin(String(body.slug)) : null;
    const pick = (k: string, fallback = "") => String(body[k] ?? "").trim() || fallback;

    const title = pick("title", existing?.title || "");
    const content = pick("content") || existing?.contentText || existing?.content || "";
    if (!title) {
      return NextResponse.json({ error: "Informe o título antes de gerar." }, { status: 400 });
    }
    if (content.replace(/<[^>]+>/g, " ").trim().length < 80) {
      return NextResponse.json(
        { error: "Escreva um pouco mais no conteúdo antes de gerar (pelo menos 80 caracteres)." },
        { status: 400 }
      );
    }

    const tags = pick("tags")
      ? pick("tags")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : existing?.tags || [];

    const built = buildSeoFromArticle({
      title,
      subtitle: pick("subtitle", existing?.subtitle || ""),
      excerpt: pick("excerpt", existing?.excerpt || ""),
      contentText: content.replace(/<[^>]+>/g, " "),
      tags,
      category: pick("category", existing?.category || ""),
      siteName: siteConfig.name,
    });

    const result: Record<string, unknown> = { mode };
    if (mode === "meta" || mode === "seo" || mode === "all") result.metaDescription = built.metaDescription;
    if (mode === "seo" || mode === "all") result.seoTitle = built.seoTitle;
    if (mode === "keywords" || mode === "all") result.keywords = built.keywords;
    if (mode === "summary" || mode === "all") result.summary = built.summary;
    if (mode === "alt" || mode === "all") result.coverAlt = built.coverAlt;

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? `Falha na geração: ${e.message}` : "Falha na geração." },
      { status: 500 }
    );
  }
}
