import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  extractGoldTip,
  formatDate,
  getAdjacentArticles,
  getAllSlugs,
  getArticleBySlug,
  getRelatedArticles,
  resolveAuthor,
} from "@/lib/articles";
import { buildArticleJsonLd, buildPageMetadata } from "@/lib/seo";
import { ReadingProgress } from "@/components/article/ReadingProgress";
import { TableOfContents } from "@/components/article/TableOfContents";
import { ShareButtons } from "@/components/article/ShareButtons";
import { ArticleBody } from "@/components/article/ArticleBody";
import { ArticleAudio } from "@/components/article/ArticleAudio";
import { ArticleListen } from "@/components/article/ArticleListen";
import { ArticleSidebar } from "@/components/article/ArticleSidebar";
import { RelatedArticles } from "@/components/article/RelatedArticles";
import { ArticleNav } from "@/components/article/ArticleNav";
import { CommentsPlaceholder } from "@/components/article/CommentsPlaceholder";
import { AdSlot } from "@/components/ui/AdSlot";
import { AffiliateBlock } from "@/components/ui/AffiliateBlock";
import { NewsletterForm } from "@/components/ui/NewsletterForm";

export const revalidate = 300;

// Artigo duplicado — mantido em content/ como "draft" e redirecionado via next.config.ts.
const EXCLUDED_SLUGS = new Set([
  "o-templo-fisico-como-a-postura-diaria-afeta-sua-energia-vital-2",
]);

export async function generateStaticParams() {
  return (await getAllSlugs())
    .filter((slug) => !EXCLUDED_SLUGS.has(slug))
    .map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  // rascunho/agendado não pode vazar título nem ser indexado
  if (!article || article.status !== "published") {
    return { robots: { index: false, follow: false } };
  }
  return buildPageMetadata({
    title: article.seo.title,
    description: article.seo.description,
    path: `/artigos/${article.slug}`,
    image: article.coverImage,
    type: "article",
    keywords: article.seo.keywords,
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article || article.status !== "published") notFound();

  const related = await getRelatedArticles(article, 3);
  const { prev, next } = await getAdjacentArticles(slug);
  const jsonLd = buildArticleJsonLd(article);
  const author = resolveAuthor(article.author);
  const goldTip = extractGoldTip(article.content, article.goldTip);

  return (
    <>
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="article-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Início</Link>
            <span>/</span>
            <Link href={`/categoria/${article.categorySlug}`}>{article.category}</Link>
            <span>/</span>
            <span aria-current="page">{article.title}</span>
          </nav>
          <div className="meta">
            <Link href={`/categoria/${article.categorySlug}`} className="pill">
              {article.category}
            </Link>
            <span>{formatDate(article.publishedAt)}</span>
            <span>{article.readingTime} min de leitura</span>
            {author && <span>Por {author}</span>}
          </div>
          <h1>{article.title}</h1>
          {article.subtitle && <p className="subtitle">{article.subtitle}</p>}
          <p style={{ color: "var(--text-muted)", maxWidth: "46rem" }}>{article.excerpt}</p>
          <ShareButtons title={article.title} slug={article.slug} />
          <div className="article-cover">
            <Image
              src={article.coverImage}
              alt={article.coverAlt}
              width={1400}
              height={600}
              priority
              sizes="100vw"
              unoptimized={article.coverImage.endsWith(".svg") || article.coverImage.includes("/api/") || article.coverImage.startsWith("http")}
            />
          </div>
        </div>
      </header>

      <div className="container article-layout">
        <aside className="toc-desktop">
          <TableOfContents items={article.toc} />
        </aside>

        <article>
          {article.audioUrl ? (
            <ArticleAudio src={article.audioUrl} title={article.title} />
          ) : (
            <ArticleListen
              text={article.contentText || article.content.replace(/<[^>]+>/g, " ")}
              title={article.title}
            />
          )}

          <ArticleBody content={article.content} />

          {author && <p className="article-byline">Por {author}</p>}

          {article.faq?.length > 0 && (
            <section style={{ marginTop: "2.5rem" }}>
              <h2 style={{ fontFamily: "var(--font-serif)" }}>Perguntas frequentes</h2>
              {article.faq.map((f) => (
                <details key={f.question} style={{ marginBottom: "0.8rem" }}>
                  <summary style={{ cursor: "pointer", fontWeight: 600 }}>{f.question}</summary>
                  <p style={{ color: "var(--text-muted)" }}>{f.answer}</p>
                </details>
              ))}
            </section>
          )}

          <AdSlot id="article-end" label="Anúncio — final do artigo" />
          <AffiliateBlock />
          <ArticleNav prev={prev} next={next} />

          <div className="newsletter" style={{ margin: "2rem 0" }}>
            <h2>Gostou deste artigo?</h2>
            <p>Receba novos conteúdos de saúde integral no seu e-mail.</p>
            <NewsletterForm source={`article:${article.slug}`} />
          </div>

          <CommentsPlaceholder />
          <RelatedArticles articles={related} />
        </article>

        <ArticleSidebar
          tags={article.tags}
          category={article.category}
          categorySlug={article.categorySlug}
          goldTip={goldTip}
          authorName={article.author}
        />
      </div>
    </>
  );
}
