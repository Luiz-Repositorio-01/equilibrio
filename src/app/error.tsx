"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="section">
      <div className="container" style={{ textAlign: "center", maxWidth: 640 }}>
        <div className="section__eyebrow">Algo deu errado</div>
        <h1 style={{ fontFamily: "var(--font-serif)" }}>Não foi possível carregar esta página</h1>
        <p style={{ color: "var(--text-muted)" }}>
          Tivemos um problema temporário. Tente novamente em instantes.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button type="button" className="btn btn--primary" onClick={() => reset()}>
            Tentar novamente
          </button>
          <Link href="/" className="btn btn--outline">
            Voltar para o início
          </Link>
        </div>
      </div>
    </section>
  );
}
