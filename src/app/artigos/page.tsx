import Link from "next/link";
import { getArticleSummaries, getAllCategories } from "@/lib/articles";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { CategoryPills } from "@/components/ui/CategoryPills";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Artigos",
  description:
    "Todos os artigos do portal SAÚDE INTEGRAL sobre corpo, mente, espiritualidade e bem-estar.",
  path: "/artigos",
});

export const revalidate = 300;

const PER_PAGE = 9;

export default async function ArtigosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam || 1));
  const all = await getArticleSummaries();
  const categories = await getAllCategories();
  const totalPages = Math.max(1, Math.ceil(all.length / PER_PAGE));
  const current = Math.min(page, totalPages);
  const items = all.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  return (
    <section className="section">
      <div className="container">
        <div className="section__head">
          <div>
            <div className="section__eyebrow">Biblioteca</div>
            <h1 className="section__title">Todos os artigos</h1>
            <p className="section__desc">
              {all.length} conteúdos publicados sobre equilíbrio integral.
            </p>
          </div>
        </div>
        <CategoryPills categories={categories} />
        <div className="grid-articles" style={{ marginTop: "1.5rem" }}>
          {items.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
        <div style={{ display: "flex", gap: "0.6rem", marginTop: "2rem", flexWrap: "wrap" }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/artigos?page=${p}`}
              className={`btn ${p === current ? "btn--primary" : "btn--outline"}`}
              aria-current={p === current ? "page" : undefined}
            >
              {p}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
