import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getArticleAdmin, saveArticle } from "@/lib/cms";
import { generateCoverPackage } from "@/lib/cover-ai";
import { canWriteCoverFiles, dynamicCoverUrl } from "@/lib/publish";
import { revalidatePath } from "next/cache";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const slug = String(body.slug || "");
    if (!slug) return NextResponse.json({ error: "Slug obrigatório" }, { status: 400 });

    const article = await getArticleAdmin(slug);
    if (!article) {
      return NextResponse.json({ error: "Artigo não encontrado" }, { status: 404 });
    }

    if (!canWriteCoverFiles) {
      // Produção: disco somente leitura — usa a arte editorial dinâmica.
      const updatedProd = await saveArticle({ ...article, coverImage: dynamicCoverUrl(article) });
      revalidatePath("/", "layout");
      return NextResponse.json({
        ok: true,
        article: updatedProd,
        cover: { coverImage: updatedProd.coverImage },
      });
    }

    const pack = await generateCoverPackage(
      {
        slug: article.slug,
        title: article.title,
        subtitle: article.subtitle,
        excerpt: article.excerpt,
        contentText: article.contentText || article.content.replace(/<[^>]+>/g, " "),
        category: article.category,
        categorySlug: article.categorySlug,
        tags: article.tags,
      },
      { forceSeed: body.forceNew ? Date.now() : undefined }
    );

    const updated = await saveArticle({
      ...article,
      coverImage: pack.coverImage,
      coverAlt: pack.coverAlt,
      coverCaption: pack.coverCaption,
      coverDescription: pack.coverDescription,
      coverVariants: pack.coverVariants,
      coverMeta: pack.coverMeta,
    });

    return NextResponse.json({ ok: true, article: updated, cover: pack });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Falha ao gerar capa" },
      { status: 500 }
    );
  }
}
