import Link from "next/link";
import Image from "next/image";
import type { ArticleSummary } from "@/lib/types";
import { formatDate } from "@/lib/articles";

export function FeaturedArticle({ article }: { article: ArticleSummary }) {
  return (
    <article className="featured fade-in">
      <Link
        href={`/artigos/${article.slug}`}
        className="featured__media"
        data-track="article_open"
        data-track-slug={article.slug}
      >
        <Image
          src={article.coverImage}
          alt={article.coverAlt || article.title}
          width={900}
          height={600}
          priority
          sizes="(max-width: 860px) 100vw, 55vw"
          unoptimized={article.coverImage.endsWith(".svg") || article.coverImage.includes("/api/cover-art")}
        />
      </Link>
      <div className="featured__body">
        <span className="section__eyebrow">Artigo em destaque</span>
        <div className="meta">
          <Link href={`/categoria/${article.categorySlug}`} className="pill">
            {article.category}
          </Link>
          <span>{formatDate(article.publishedAt)}</span>
          <span>{article.readingTime} min de leitura</span>
        </div>
        <h2 className="featured__title">
          <Link href={`/artigos/${article.slug}`}>{article.title}</Link>
        </h2>
        <p style={{ color: "var(--text-muted)", margin: 0 }}>{article.excerpt}</p>
        <div>
          <Link
            href={`/artigos/${article.slug}`}
            className="btn btn--primary"
            data-track="cta_click"
            data-track-label="Ler destaque"
          >
            Ler artigo
          </Link>
        </div>
      </div>
    </article>
  );
}
