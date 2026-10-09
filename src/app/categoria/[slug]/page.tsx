import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllCategories, getArticlesByCategory } from "@/lib/articles";
import { siteConfig } from "@/lib/site";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getAllCategories()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = siteConfig.categories.find((c) => c.slug === slug) ||
    (await getAllCategories()).find((c) => c.slug === slug);
  if (!cat) return {};
  return buildPageMetadata({
    title: cat.name,
    description: "description" in cat ? cat.description : `Artigos sobre ${cat.name}`,
    path: `/categoria/${slug}`,
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const articles = await getArticlesByCategory(slug);
  const cat =
    siteConfig.categories.find((c) => c.slug === slug) ||
    (await getAllCategories()).find((c) => c.slug === slug);
  if (!cat || !articles.length) notFound();

  return (
    <section className="section">
      <div className="container">
        <div className="section__eyebrow">Categoria</div>
        <h1 className="section__title">{cat.name}</h1>
        <p className="section__desc">
          {"description" in cat ? cat.description : `${articles.length} artigos publicados.`}
        </p>
        <div className="grid-articles" style={{ marginTop: "2rem" }}>
          {articles.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </div>
    </section>
  );
}
