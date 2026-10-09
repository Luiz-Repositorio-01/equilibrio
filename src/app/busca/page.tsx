import { searchArticles } from "@/lib/articles";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { SearchBox } from "@/components/ui/SearchBox";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Busca",
  description: "Busque artigos por título, categoria, tags ou conteúdo.",
  path: "/busca",
});

export default async function BuscaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = q ? await searchArticles(q) : [];

  return (
    <section className="section">
      <div className="container">
        <div className="section__eyebrow">Busca</div>
        <h1 className="section__title">Encontre o que você precisa</h1>
        <div style={{ margin: "1.5rem 0" }}>
          <SearchBox />
        </div>
        {q && (
          <>
            <p className="section__desc">
              {results.length} resultado(s) para “{q}”.
            </p>
            <div className="grid-articles" style={{ marginTop: "1.5rem" }}>
              {results.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
