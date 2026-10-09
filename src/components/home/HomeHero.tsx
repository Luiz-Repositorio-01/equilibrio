import Image from "next/image";
import Link from "next/link";
import type { ArticleSummary } from "@/lib/types";
import { MagneticButton } from "@/components/cinema/MagneticButton";

const themes = [
  {
    href: "/categoria/saude-do-corpo",
    label: "Corpo",
    desc: "Vitalidade, movimento e presença física.",
    icon: "M12 3c2 4 5 6 5 10a5 5 0 11-10 0c0-4 3-6 5-10z",
  },
  {
    href: "/categoria/saude-da-mente",
    label: "Mente",
    desc: "Clareza emocional e equilíbrio interior.",
    icon: "M12 3a7 7 0 00-4 12.7V19h8v-3.3A7 7 0 0012 3z",
  },
  {
    href: "/categoria/saude-espiritual",
    label: "Espírito",
    desc: "Conexão, presença e paz profunda.",
    icon: "M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2z",
  },
  {
    href: "/artigos",
    label: "Equilíbrio",
    desc: "A integração que transforma a rotina.",
    icon: "M12 4a8 8 0 100 16 8 8 0 000-16zm0 3v10m-5-5h10",
  },
];

export function HomeHero({ featured }: { featured?: ArticleSummary | null }) {
  const cover =
    featured?.coverVariants?.thumb ||
    featured?.coverVariants?.home ||
    featured?.coverImage ||
    "";
  const coverUnoptimized = cover.endsWith(".svg") || cover.includes("/api/") || cover.startsWith("http");

  return (
    <section className="cinema-hero" aria-label="Experiência principal">
      <div className="cinema-hero__bg" />
      <div className="cinema-hero__media">
        <Image
          src="/assets/hero-consciousness.webp"
          alt="Escultura digital de consciência — silhueta em meditação com energia luminosa"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center 30%" }}
        />
      </div>
      <div className="cinema-hero__overlay" />
      <div className="cinema-hero__rings" aria-hidden="true">
        <div className="cinema-hero__ring" />
        <div className="cinema-hero__ring" />
        <div className="cinema-hero__ring" />
      </div>
      <div className="cinema-hero__particles" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="cinema-hero__particle" />
        ))}
      </div>

      <div className="cinema-hero__content">
        <div className="cinema-hero__layout">
          <div className="cinema-hero__copy">
            {featured && (
              <Link
                href={`/artigos/${featured.slug}`}
                className="cinema-daily"
                aria-label={`Destaque do dia: ${featured.title}`}
              >
                {cover && (
                  <span className="cinema-daily__thumb">
                    <Image
                      src={cover}
                      alt=""
                      fill
                      sizes="64px"
                      style={{ objectFit: "cover" }}
                      unoptimized={coverUnoptimized}
                    />
                  </span>
                )}
                <span className="cinema-daily__body">
                  <span className="cinema-daily__eyebrow">Destaque do Dia</span>
                  <span className="cinema-daily__title">{featured.title}</span>
                  <span className="cinema-daily__meta">
                    {featured.readingTime} min de leitura
                    <span aria-hidden="true"> · </span>
                    {featured.category}
                  </span>
                </span>
                <span className="cinema-daily__go" aria-hidden="true">
                  Ler artigo →
                </span>
              </Link>
            )}
            <p className="cinema-eyebrow">SAÚDE INTEGRAL · Espiritual · Mental · Corpo</p>
            <h1 className="cinema-title">
              Equilíbrio que <em>transforma.</em>
            </h1>
            <p className="cinema-subtitle">Vida que floresce.</p>
            <div className="cinema-hero__actions">
              <MagneticButton
                href="/artigos"
                className="btn-cinema--primary"
                track="Explorar artigos"
              >
                Explorar artigos
                <span aria-hidden="true">→</span>
              </MagneticButton>
            </div>
          </div>

          <aside className="cinema-themes-panel" aria-label="Navegue por temas">
            <p className="cinema-themes-panel__title">Navegue por temas</p>
            <div className="cinema-themes">
              {themes.map((t) => (
                <Link key={t.href + t.label} href={t.href} className="cinema-themes__item">
                  <span className="cinema-themes__icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d={t.icon} />
                    </svg>
                  </span>
                  <span>
                    <span className="cinema-themes__label">{t.label}</span>
                    <p className="cinema-themes__desc">{t.desc}</p>
                  </span>
                </Link>
              ))}
            </div>
            <Link href="/artigos" className="cinema-themes-panel__more">
              Ver todos os temas →
            </Link>
          </aside>
        </div>
      </div>

      <div className="cinema-scroll-cue" aria-hidden="true">
        <span>Role para explorar</span>
        <span className="cinema-scroll-cue__line" />
      </div>
    </section>
  );
}
