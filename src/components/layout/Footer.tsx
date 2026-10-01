import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div style={{ marginBottom: "0.8rem" }}>
              <BrandLogo size="sm" href="/" />
            </div>
            <p style={{ color: "var(--text-muted)", maxWidth: "28rem" }}>
              {siteConfig.tagline} Portal premium de bem-estar integrado —
              espiritual, mental e corpo.
            </p>
          </div>
          <div>
            <h3 style={{ fontFamily: "var(--font-serif)", marginTop: 0 }}>Explorar</h3>
            <div style={{ display: "grid", gap: "0.45rem", color: "var(--text-muted)" }}>
              <Link href="/artigos">Artigos</Link>
              <Link href="/categoria/saude-do-corpo">Saúde do Corpo</Link>
              <Link href="/categoria/saude-da-mente">Saúde da Mente</Link>
              <Link href="/categoria/saude-espiritual">Saúde Espiritual</Link>
              <Link href="/busca">Busca</Link>
            </div>
          </div>
          <div>
            <h3 style={{ fontFamily: "var(--font-serif)", marginTop: 0 }}>Institucional</h3>
            <div style={{ display: "grid", gap: "0.45rem", color: "var(--text-muted)" }}>
              <Link href="/sobre">Sobre</Link>
              <Link href="/contato">Contato</Link>
              <Link href="/privacidade">Privacidade</Link>
              <Link href="/termos">Termos de Uso</Link>
              <Link href="/rss.xml">RSS</Link>
            </div>
          </div>
          <div>
            <h3 style={{ fontFamily: "var(--font-serif)", marginTop: 0 }}>Newsletter</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
              Receba conteúdos selecionados sobre equilíbrio e qualidade de vida.
            </p>
            <NewsletterForm compact source="footer" />
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom__row">
            <span>
              © {year} {siteConfig.name}. Todos os direitos reservados.
            </span>
            <nav className="footer-bottom__legal" aria-label="Links legais">
              <Link href="/privacidade">Privacidade</Link>
              <span aria-hidden="true">·</span>
              <Link href="/termos">Termos</Link>
              <span aria-hidden="true">·</span>
              <Link href="/contato">Contato</Link>
            </nav>
          </div>
          <div className="footer-bottom__row">
            <span className="footer-bottom__trust">
              Dados protegidos · Cancelamento simples · Conteúdo sem spam
            </span>
            <span className="footer-bottom__credit">
              Produzido por <strong>Auryx Media Soluções Tecnológicas</strong>. Todos os
              direitos reservados.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
