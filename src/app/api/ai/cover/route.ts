import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getArticleAdmin, slugify } from "@/lib/cms";
import { generateCoverPackage } from "@/lib/cover-ai";
import { dynamicCoverUrl } from "@/lib/publish";

export const maxDuration = 60;

/**
 * Gera uma sugestão de capa a partir do texto do formulário (artigo novo ou existente).
 * NÃO salva nada: o editor aplica o resultado no formulário e o artigo só muda ao Publicar.
 */
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json(
      { error: "Sua sessão expirou. Entre novamente no painel." },
      { status: 401 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const existing = body.slug ? await getArticleAdmin(String(body.slug)) : null;
  const pick = (k: string, fallback = "") => String(body[k] ?? "").trim() || fallback;

  const title = pick("title", existing?.title || "");
  if (!title) {
    return NextResponse.json({ error: "Informe o título para gerar a capa." }, { status: 400 });
  }
  const slug = existing?.slug || slugify(title) || "artigo";
  const category = pick("category", existing?.category || "Saúde da Mente");
  const categorySlug = pick("categorySlug", existing?.categorySlug || "saude-da-mente");
  const tags = pick("tags")
    ? pick("tags")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : existing?.tags || [];
  const content = pick("content") || existing?.contentText || existing?.content || "";

  const reasonOut: { reason?: string } = {};
  try {
    const pack = await generateCoverPackage(
      {
        slug,
        title,
        subtitle: pick("subtitle", existing?.subtitle || ""),
        excerpt: pick("excerpt", existing?.excerpt || ""),
        contentText: content.replace(/<[^>]+>/g, " "),
        category,
        categorySlug,
        tags,
      },
      { forceSeed: body.forceNew ? Date.now() : undefined, reasonOut }
    );
    const isPhoto = String(pack.coverMeta?.engine || "").includes("photo");
    return NextResponse.json({
      ok: true,
      cover: pack,
      fallback: !isPhoto,
      reason: isPhoto
        ? undefined
        : reasonOut.reason || "Nenhuma foto adequada ao tema foi encontrada.",
    });
  } catch (e) {
    // Sem foto e sem como gravar a arte (produção): usa a arte automática do site, gerada na hora.
    console.error("[ai/cover] falhou", e);
    const cover = {
      coverImage: dynamicCoverUrl({ slug, title, categorySlug }),
      coverAlt: `Arte editorial do artigo: ${title}`,
      coverCaption: "Arte editorial automática do site",
      coverDescription: `Arte editorial gerada automaticamente para o tema do artigo (${category}).`,
    };
    return NextResponse.json({
      ok: true,
      cover,
      fallback: true,
      reason: reasonOut.reason || "Os bancos de fotos não responderam.",
    });
  }
}
