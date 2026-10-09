import Link from "next/link";
import type { ArticleSummary } from "@/lib/types";
import { Reveal } from "@/components/cinema/Reveal";
import { MagneticButton } from "@/components/cinema/MagneticButton";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { AdSlot } from "@/components/ui/AdSlot";

function coverSrc(article: ArticleSummary, variant: "home" | "featured" | "thumb" = "home") {
  const fromVariants = article.coverVariants?.[variant] || article.coverVariants?.home;
  if (fromVariants) return fromVariants;
  const img = article.coverImage || "";
  if (
    img &&
    !img.includes("hero-bg") &&
    !img.includes("hero-photo") &&
    !img.includes("hero-consciousness")
  ) {
    return img;
  }
  return `/api/cover-art?slug=${encodeURIComponent(article.slug)}&title=${encodeURIComponent(article.title)}&cat=${encodeURIComponent(article.categorySlug)}`;
}

export function HomeFeatureRail() {
  const items = [
    { title: "Conteúdo Profundo", desc: "Textos originais com densidade editorial." },
    { title: "Abordagem Integrativa", desc: "Corpo, mente e espírito em um só fluxo." },
    { title: "Atualizações Constantes", desc: "Novas leituras para manter a jornada viva." },
    { title: "Comunidade Premium", desc: "Um clube de consciência, não um feed." },
  ];
  return (
    <div className="cinema-rail">
      {items.map((item) => (
        <div key={item.title} className="cinema-rail__item">
          <div className="cinema-rail__value">{item.title}</div>
          <div className="cinema-rail__label">{item.desc}</div>
        </div>
      ))}
    </div>
  );
}

const TRUST_ICONS: Record<string, React.ReactNode> = {
  // folha / equilíbrio
  pilares: (
    <>
      <path d="M12 21c-4.5-2-7-5.5-7-10 4 0 7 1.5 7 5 0-3.5 3-5 7-5 0 4.5-2.5 8-7 10z" />
      <path d="M12 21V11" />
    </>
  ),
  // pena / texto autoral
  autoral: (
    <>
      <path d="M20 4c-7 0-12 4-13 11l-2 5 5-2c7-1 10-6 10-14z" />
      <path d="M9 15l6-6" />
    </>
  ),
  // sol / reflexão do dia
  dia: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  // coração / cuidado
  cuidado: (
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
  ),
  // escudo / sem spam
  seguro: (
    <>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
};

export function HomeTrustStrip() {
  const items = [
    { icon: "pilares", k: "Três pilares", v: "Espiritual, mental e corpo" },
    { icon: "autoral", k: "Conteúdo autoral", v: "Artigos originais, escritos para você" },
    { icon: "dia", k: "Pílula do dia", v: "Uma reflexão diária na home" },
    { icon: "cuidado", k: "Leitura serena", v: "Sem pressa e sem excesso" },
    { icon: "seguro", k: "Sem spam", v: "Só conteúdo que vale a pena" },
  ];
  return (
    <div className="trust-strip">
      {items.map((i) => (
        <div key={i.k + i.v} className="trust-strip__item">
          <span className="trust-strip__icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {TRUST_ICONS[i.icon]}
            </svg>
          </span>
          <div>
            <strong>{i.k}</strong>
            <div>{i.v}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function HomeContentHub({
  featured,
  popular,
  recent,
}: {
  featured: ArticleSummary | null;
  popular: ArticleSummary[];
  recent: ArticleSummary[];
}) {
  return (
    <section className="cinema-section">
      <div className="cinema-container">
        <div className="cinema-grid">
          <div className="cinema-grid__main">
            {featured && (
              <Reveal>
                <article className="featured-cinema">
                  <Link href={`/artigos/${featured.slug}`} className="featured-cinema__media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverSrc(featured, "featured")}
                      alt={featured.coverAlt || featured.title}
                      loading="eager"
                    />
                  </Link>
                  <div className="featured-cinema__body">
                    <div className="featured-cinema__meta">
                      <span className="featured-cinema__tag">Destaque do dia</span>
                      {featured.category && (
                        <span className="featured-cinema__cat">{featured.category}</span>
                      )}
                    </div>
                    <h2 className="featured-cinema__title">
                      <Link href={`/artigos/${featured.slug}`}>{featured.title}</Link>
                    </h2>
                    <p className="featured-cinema__excerpt">{featured.excerpt}</p>
                    <Link href={`/artigos/${featured.slug}`} className="featured-cinema__link">
                      Ler artigo →
                    </Link>
                  </div>
                </article>
              </Reveal>
            )}

            <AdSlot id="home-feed" label="Anúncio — in-feed" minHeight={56} frame="home" />

            <Reveal delay={1}>
              <div className="cinema-section__head">
                <h2>Novidades</h2>
                <Link href="/artigos">Ver todos</Link>
              </div>
              <div className="news-rail">
                <div className="news-rail__track">
                  {recent.slice(0, 8).map((a) => (
                    <Link key={a.slug} href={`/artigos/${a.slug}`} className="news-rail__card">
                      <div className="news-rail__thumb">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={coverSrc(a, "home")} alt={a.coverAlt || a.title} loading="lazy" />
                      </div>
                      <div className="news-rail__body">
                        {a.category && <span className="news-rail__cat">{a.category}</span>}
                        <h3 className="news-rail__title">{a.title}</h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          <aside className="cinema-grid__aside">
            <Reveal variant="right">
              <div className="glass-card">
                <h3 className="glass-card__title">Mais lidos</h3>
                <ol className="rank-list">
                  {popular.slice(0, 5).map((a, i) => (
                    <li key={a.slug} className="rank-list__item" style={{ counterReset: "none" }}>
                      <Link href={`/artigos/${a.slug}`}>
                        <span className="rank-list__num" style={{ color: "var(--cin-gold)", fontFamily: "var(--cin-font-serif)", marginRight: "0.6rem" }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="rank-list__title">{a.title}</span>
                        <div className="rank-list__meta">{a.readingTime} min de leitura</div>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>

            <Reveal variant="right" delay={2}>
              <div className="nl-premium">
                <h3 className="nl-premium__title">Receba conteúdos exclusivos</h3>
                <p className="nl-premium__text">
                  Materiais selecionados, atualizações e acesso antecipado — sem ruído.
                </p>
                <div className="nl-premium__form">
                  <NewsletterForm source="home-cinema" />
                </div>
              </div>
            </Reveal>
          </aside>
        </div>
      </div>
    </section>
  );
}

export function HomeSponsors() {
  const brands = ["Aether", "Lumina", "Nord", "Vesper", "Orbit", "Halo"];
  return (
    <section className="cinema-section sponsors-cinema">
      <div className="cinema-container">
        <Reveal>
          <div className="cinema-section__head">
            <h2>Parceiros & Patrocinadores</h2>
            <Link href="/contato">Anuncie aqui</Link>
          </div>
          <p className="cinema-subtitle" style={{ margin: "0 0 2rem" }}>
            Espaço sofisticado para marcas alinhadas à consciência e ao luxo editorial.
          </p>
        </Reveal>
        <div className="sponsors-cinema__grid">
          {brands.map((b) => (
            <div key={b} className="sponsors-cinema__logo" aria-label={b}>
              <span style={{ fontFamily: "var(--cin-font-serif)", fontSize: "1.2rem", letterSpacing: "0.12em" }}>
                {b}
              </span>
            </div>
          ))}
        </div>
        <AdSlot id="sponsor-banner" label="Leaderboard / patrocínio premium" minHeight={56} frame="home" />
      </div>
    </section>
  );
}

export function HomeTestimonials() {
  const items = [
    {
      quote: "Pela primeira vez um portal de bem-estar que parece uma experiência, não um blog.",
      name: "Mariana S.",
    },
    {
      quote: "A profundidade dos textos e o cuidado visual me fazem voltar toda semana.",
      name: "Ricardo A.",
    },
    {
      quote: "Sofisticação rara. Dá vontade de ler com calma — e isso muda tudo.",
      name: "Helena P.",
    },
  ];
  return (
    <section className="cinema-section testimonials-cinema">
      <div className="cinema-container">
        <Reveal>
          <p className="cinema-eyebrow">Depoimentos</p>
          <h2 className="cinema-title" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
            Quem já entrou na jornada
          </h2>
        </Reveal>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.25rem",
            marginTop: "2rem",
          }}
        >
          {items.map((t, i) => (
            <Reveal key={t.name} delay={(i + 1) as 1 | 2 | 3} className="glass-card">
              <p className="glass-card__text" style={{ fontFamily: "var(--cin-font-serif)", fontSize: "1.15rem", color: "var(--cin-champagne)" }}>
                “{t.quote}”
              </p>
              <p style={{ margin: "1rem 0 0", color: "var(--cin-gold)", fontSize: "0.85rem" }}>{t.name}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeFAQ() {
  const faqs = [
    {
      q: "O conteúdo é original?",
      a: "Sim. Todos os artigos são autorais, revisados e publicados com cuidado editorial.",
    },
    {
      q: "Com que frequência há conteúdo novo?",
      a: "Publicamos novos artigos regularmente sobre corpo, mente e espírito.",
    },
    {
      q: "Os anúncios atrapalham a leitura?",
      a: "Não. Os espaços publicitários são posicionados para não interromper o fluxo de leitura.",
    },
    {
      q: "O conteúdo substitui orientação profissional?",
      a: "Não. Nosso conteúdo é informativo e educativo; consulte sempre um profissional de saúde.",
    },
  ];
  return (
    <section className="cinema-section faq-cinema">
      <div className="cinema-container" style={{ maxWidth: 820 }}>
        <Reveal>
          <p className="cinema-eyebrow">FAQ</p>
          <h2 className="cinema-title" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
            Perguntas frequentes
          </h2>
        </Reveal>
        <div style={{ marginTop: "1.5rem" }}>
          {faqs.map((f) => (
            <details key={f.q} className="faq-cinema__item">
              <summary className="faq-cinema__question">
                {f.q}
                <span className="faq-cinema__icon" aria-hidden="true">
                  +
                </span>
              </summary>
              <div className="faq-cinema__answer">{f.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SocialRail() {
  return (
    <aside className="social-rail" aria-label="Redes sociais">
      <a className="social-rail__link" href="https://instagram.com/equilibriointegral" target="_blank" rel="noreferrer" aria-label="Instagram">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>
      </a>
      <a className="social-rail__link" href="https://youtube.com/@equilibriointegral" target="_blank" rel="noreferrer" aria-label="YouTube">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 8a4 4 0 014-4h8a4 4 0 014 4v8a4 4 0 01-4 4H8a4 4 0 01-4-4V8z"/><path d="M10 9.5l5 2.5-5 2.5V9.5z" fill="currentColor"/></svg>
      </a>
      <a className="social-rail__link" href="mailto:contato@equilibriointegral.com.br" aria-label="E-mail">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 7 9-7"/></svg>
      </a>
    </aside>
  );
}
