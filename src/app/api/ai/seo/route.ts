import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getArticleAdmin, saveArticle } from "@/lib/cms";
import { buildSeoFromArticle } from "@/lib/cover-ai";
import { siteConfig } from "@/lib/site";

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const mode = String(body.mode || "all");
    const slug = body.slug ? String(body.slug) : "";

    const source = slug
      ? await getArticleAdmin(slug)
      : {
          title: String(body.title || ""),
          subtitle: String(body.subtitle || ""),
          excerpt: String(body.excerpt || ""),
          contentText: String(body.content || ""),
          tags: Array.isArray(body.tags)
            ? body.tags
            : String(body.tags || "")
                .split(",")
                .map((t: string) => t.trim())
                .filter(Boolean),
          category: String(body.category || ""),
        };

    if (!source || !("title" in source) || !source.title) {
      return NextResponse.json({ error: "Dados insuficientes" }, { status: 400 });
    }

    const built = buildSeoFromArticle({
      title: source.title,
      subtitle: "subtitle" in source ? source.subtitle : body.subtitle,
      excerpt: "excerpt" in source ? source.excerpt : body.excerpt,
      contentText:
        "contentText" in source && source.contentText
          ? source.contentText
          : "content" in source && typeof source.content === "string"
            ? source.content.replace(/<[^>]+>/g, " ")
            : String(body.content || ""),
      tags: "tags" in source ? source.tags : body.tags,
      category: "category" in source ? source.category : body.category,
      siteName: siteConfig.name,
    });

    const result: Record<string, unknown> = { mode };

    if (mode === "meta" || mode === "all") result.metaDescription = built.metaDescription;
    if (mode === "keywords" || mode === "all") result.keywords = built.keywords;
    if (mode === "summary" || mode === "all") result.summary = built.summary;
    if (mode === "seo" || mode === "all") {
      result.seoTitle = built.seoTitle;
      result.metaDescription = built.metaDescription;
      result.keywords = built.keywords;
    }
    if (mode === "alt" || mode === "all") result.coverAlt = built.coverAlt;

    if (slug && body.persist) {
      const article = await getArticleAdmin(slug);
      if (article) {
        const updated = await saveArticle({
          ...article,
          excerpt: mode === "summary" || mode === "all" ? built.summary : article.excerpt,
          coverAlt: mode === "alt" || mode === "all" ? built.coverAlt : article.coverAlt,
          seo: {
            title: built.seoTitle,
            description: built.metaDescription,
            keywords: built.keywords,
          },
          tags:
            mode === "keywords" || mode === "all"
              ? [...new Set([...(article.tags || []), ...built.keywords])].slice(0, 12)
              : article.tags,
        });
        result.article = updated;
      }
    }

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Falha na geração SEO" },
      { status: 500 }
    );
  }
}
