"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#0a1f35",
          color: "#f7f4ef",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "1.5rem",
        }}
      >
        <div>
          <h1>Algo deu errado</h1>
          <p style={{ opacity: 0.8 }}>Tivemos um problema temporário. Tente novamente em instantes.</p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "0.7rem 1.4rem",
              borderRadius: 999,
              border: 0,
              background: "#c9a96e",
              color: "#0a1f35",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
