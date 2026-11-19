import Link from "next/link";
import { getArticleSummaries, getAllCategories } from "@/lib/articles";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { CategoryPills } from "@/components/ui/CategoryPills";
import { buildPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

const LISTING_DESCRIPTION =
  "Todos os artigos do portal SAÚDE INTEGRAL sobre corpo, mente, espiritualidade e bem-estar.";

// Cada página da listagem tem artigos diferentes, então cada uma aponta para si mesma
// (canonical próprio). Só a primeira usa /artigos sem parâmetro.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam || 1));
  return buildPageMetadata({
    title: page > 1 ? `Artigos — página ${page}` : "Artigos",
    description: LISTING_DESCRIPTION,
    path: page > 1 ? `/artigos?page=${page}` : "/artigos",
  });
}

export const revalidate = 300;

const PER_PAGE = 9;

export default async function ArtigosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  // ?page=1 é a mesma página de /artigos: consolida.
  if (pageParam === "1") permanentRedirect("/artigos");
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
              {all.length} conteúdos publicados sobre saúde integral.
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
              href={p === 1 ? "/artigos" : `/artigos?page=${p}`}
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
