import { siteConfig } from "@/lib/site";
import { buildPageMetadata } from "@/lib/seo";
import Link from "next/link";
import { authorInitials, getAllAuthorProfiles } from "@/lib/authors";

export const metadata = buildPageMetadata({
  title: "Sobre",
  description: `Conheça o ${siteConfig.name} — portal premium de bem-estar integrado para espiritual, mental e corpo.`,
  path: "/sobre",
});

export default function SobrePage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 820 }}>
        <div className="section__eyebrow">Institucional</div>
        <h1 className="section__title">Sobre o {siteConfig.name}</h1>
        <p className="section__desc">{siteConfig.tagline}</p>

        <div className="prose" style={{ marginTop: "2rem" }}>
          <p>
            O {siteConfig.name} nasceu para oferecer conteúdo claro, profundo e
            aplicável sobre saúde mental, equilíbrio emocional, hábitos saudáveis,
            espiritualidade prática e qualidade de vida.
          </p>
        </div>

        <div className="mvv-grid" style={{ marginTop: "2.5rem" }}>
          <article className="mvv-card">
            <h2>Missão</h2>
            <p>{siteConfig.mission}</p>
          </article>
          <article className="mvv-card">
            <h2>Visão</h2>
            <p>{siteConfig.vision}</p>
          </article>
        </div>

        <section style={{ marginTop: "2.5rem" }} aria-labelledby="valores-title">
          <h2 id="valores-title" className="section__title" style={{ fontSize: "1.75rem" }}>
            Valores
          </h2>
          <div className="values-grid">
            {siteConfig.values.map((v) => (
              <article key={v.title} className="value-card">
                <h3>{v.title}</h3>
                <p>{v.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="autor"
          className="author-block"
          style={{ marginTop: "3rem" }}
          aria-labelledby="autor-title"
        >
          <h2 id="autor-title" className="section__title" style={{ fontSize: "1.75rem" }}>
            Quem está por trás do portal
          </h2>
          {getAllAuthorProfiles().map((author) => (
            <article key={author.slug} id={author.slug} className="author-block__inner">
              <div className="author-block__photo">
                <div className="author-block__avatar" aria-hidden="true">
                  {authorInitials(author.name)}
                </div>
              </div>
              <div className="author-block__copy">
                <p className="author-block__role">{author.role}</p>
                <h3 className="author-block__name">{author.name}</h3>
                {author.quote && <blockquote className="author-block__quote">“{author.quote}”</blockquote>}
                <p className="author-block__bio">{author.bio}</p>
              </div>
            </article>
          ))}
          <p className="author-block__pillars" style={{ marginTop: "1.25rem" }}>
            {siteConfig.pillars.join(" · ")}
          </p>
          <Link href="/contato" className="btn btn--outline" style={{ marginTop: "0.5rem" }}>
            Fale conosco
          </Link>
        </section>
      </div>
    </section>
  );
}
