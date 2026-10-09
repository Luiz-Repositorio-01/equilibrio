import Link from "next/link";
import Image from "next/image";
import type { ArticleSummary } from "@/lib/types";
import { formatDate } from "@/lib/articles";

export function ArticleCard({ article }: { article: ArticleSummary }) {
  return (
    <article className="article-card fade-in">
      <Link
        href={`/artigos/${article.slug}`}
        className="article-card__media"
        data-track="article_open"
        data-track-slug={article.slug}
        data-track-label={article.title}
      >
        <Image
          src={article.coverImage}
          alt={article.coverAlt || article.title}
          width={640}
          height={400}
          sizes="(max-width: 640px) 100vw, 33vw"
          unoptimized={
            article.coverImage.endsWith(".svg") ||
            article.coverImage.includes("/api/") ||
            article.coverImage.startsWith("http")
          }
        />
      </Link>
      <div className="article-card__body">
        <div className="meta">
          <Link href={`/categoria/${article.categorySlug}`} className="pill">
            {article.category}
          </Link>
          <span>{formatDate(article.publishedAt)}</span>
          <span>{article.readingTime} min</span>
        </div>
        <h3 className="article-card__title">
          <Link href={`/artigos/${article.slug}`}>{article.title}</Link>
        </h3>
        <p className="article-card__excerpt">{article.excerpt}</p>
      </div>
    </article>
  );
}
