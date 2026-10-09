import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthenticated } from "@/lib/auth";
import { deleteArticle, getArticleAdmin, listArticlesAdmin, slugify } from "@/lib/cms";
import { publishArticle } from "@/lib/publish";
import type { ArticleStatus } from "@/lib/types";

export const maxDuration = 60;

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ articles: await listArticlesAdmin() });
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    if (!body.title || !body.content) {
      return NextResponse.json({ error: "Título e conteúdo são obrigatórios" }, { status: 400 });
    }
    const categorySlug = body.categorySlug || slugify(body.category || "saude-da-mente");
    const content =
      body.content.includes("<")
        ? body.content
        : body.content
            .split(/\n\n+/)
            .map((p: string) => {
              const t = p.trim();
              if (!t) return "";
              if (t.startsWith("## ")) {
                const title = t.replace(/^##\s+/, "");
                return `<h2 id="${slugify(title)}">${title}</h2>`;
              }
              if (t.startsWith("### ")) {
                const title = t.replace(/^###\s+/, "");
                return `<h3 id="${slugify(title)}">${title}</h3>`;
              }
              return `<p>${t}</p>`;
            })
            .join("\n");

    const article = await publishArticle({
      ...body,
      categorySlug,
      content,
      tags: typeof body.tags === "string"
        ? body.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
        : body.tags,
      status: (body.status || "published") as ArticleStatus,
      autoCover: body.autoCover !== false,
      autoSeo: body.autoSeo !== false,
      regenerateCover: Boolean(body.regenerateCover),
    });
    // Faz home, listas, categorias, RSS e sitemap enxergarem o artigo na hora.
    revalidatePath("/", "layout");
    return NextResponse.json({ article });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao salvar" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Slug obrigatório" }, { status: 400 });
  if (!(await getArticleAdmin(slug))) {
    return NextResponse.json({ error: "Artigo não encontrado" }, { status: 404 });
  }
  try {
    await deleteArticle(slug);
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao excluir" },
      { status: 500 }
    );
  }
}
