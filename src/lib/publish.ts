import { buildSeoFromArticle, generateCoverPackage } from "./cover-ai";
import { getArticleAdmin, saveArticle } from "./cms";
import { siteConfig } from "./site";
import type { Article, ArticleStatus } from "./types";

export type PublishInput = Partial<Article> & {
  title: string;
  content: string;
  autoCover?: boolean;
  autoSeo?: boolean;
  regenerateCover?: boolean;
};

/** Fallback quando não há foto: arte editorial gerada sob demanda por /api/cover-art. */
export function dynamicCoverUrl(a: Pick<Article, "slug" | "title" | "categorySlug">) {
  return `/api/cover-art?slug=${encodeURIComponent(a.slug)}&title=${encodeURIComponent(
    a.title
  )}&cat=${encodeURIComponent(a.categorySlug)}`;
}

/**
 * Salva artigo e, na publicação, gera capa exclusiva + SEO automaticamente.
 */
export async function publishArticle(input: PublishInput): Promise<Article> {
  const status = (input.status || "published") as ArticleStatus;
  const existing = input.slug ? await getArticleAdmin(input.slug) : null;
  const plain = (input.contentText || input.content || "").replace(/<[^>]+>/g, " ");

  let seo = input.seo;
  if (input.autoSeo !== false && (!seo || input.regenerateCover)) {
    const built = buildSeoFromArticle({
      title: input.title,
      subtitle: input.subtitle,
      excerpt: input.excerpt,
      contentText: plain,
      tags: input.tags,
      category: input.category,
      siteName: siteConfig.name,
    });
    seo = {
      title: built.seoTitle,
      description: built.metaDescription,
      keywords: built.keywords,
    };
    if (!input.excerpt) input.excerpt = built.summary;
  }

  let draft = await saveArticle({
    ...input,
    contentText: plain,
    seo,
    status,
  });

  const needsCover =
    input.regenerateCover ||
    (input.autoCover !== false &&
      status !== "draft" &&
      (!draft.coverVariants ||
        !draft.coverImage ||
        draft.coverImage.includes("hero-bg") ||
        draft.coverImage.includes("/images/covers/saude-")));

  if (needsCover) {
    try {
      const pack = await generateCoverPackage({
        slug: draft.slug,
        title: draft.title,
        subtitle: draft.subtitle,
        excerpt: draft.excerpt,
        contentText: draft.contentText,
        category: draft.category,
        categorySlug: draft.categorySlug,
        tags: draft.tags,
      });
      draft = await saveArticle({
        ...draft,
        coverImage: pack.coverImage,
        coverAlt: pack.coverAlt,
        coverCaption: pack.coverCaption,
        coverDescription: pack.coverDescription,
        coverVariants: pack.coverVariants,
        coverMeta: pack.coverMeta,
      });
    } catch (err) {
      console.error("[publish] cover generation failed", err);
      const isPlaceholder =
        !draft.coverImage ||
        draft.coverImage.includes("hero-bg") ||
        draft.coverImage.includes("/images/covers/saude-");
      if (isPlaceholder) {
        draft = await saveArticle({ ...draft, coverImage: dynamicCoverUrl(draft) });
      }
    }
  }

  return draft;
}
