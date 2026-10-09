import Link from "next/link";

export const metadata = {
  title: "Página não encontrada",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="section">
      <div className="container" style={{ textAlign: "center", maxWidth: 640 }}>
        <div className="section__eyebrow">Erro 404</div>
        <h1 style={{ fontFamily: "var(--font-serif)" }}>Página não encontrada</h1>
        <p style={{ color: "var(--text-muted)" }}>
          O endereço que você acessou não existe ou o conteúdo foi retirado do ar. Que tal
          continuar a leitura por outro caminho?
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" className="btn btn--primary">
            Voltar para o início
          </Link>
          <Link href="/artigos" className="btn btn--outline">
            Ver todos os artigos
          </Link>
        </div>
      </div>
    </section>
  );
}
