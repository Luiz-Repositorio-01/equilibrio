import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllTags, getArticlesByTag } from "@/lib/articles";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getAllTags()).map((t) => ({ slug: t.tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = decodeURIComponent(slug);
  return buildPageMetadata({
    title: `#${tag}`,
    description: `Artigos com a tag ${tag} no portal SAÚDE INTEGRAL.`,
    path: `/tag/${slug}`,
  });
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tag = decodeURIComponent(slug);
  const articles = await getArticlesByTag(tag);
  if (!articles.length) notFound();

  return (
    <section className="section">
      <div className="container">
        <div className="section__eyebrow">Tag</div>
        <h1 className="section__title">#{tag}</h1>
        <p className="section__desc">{articles.length} artigos encontrados.</p>
        <div className="grid-articles" style={{ marginTop: "2rem" }}>
          {articles.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </div>
    </section>
  );
}
