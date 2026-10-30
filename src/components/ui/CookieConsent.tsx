"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "ei-cookie-consent";

/**
 * Banner de consentimento de cookies (LGPD).
 * Registra a escolha do usuário em localStorage e dispara um evento no dataLayer,
 * permitindo que a publicidade/analytics respeitem a preferência.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) setVisible(true);
    } catch {
      // localStorage indisponível — não exibe para não travar a experiência
    }
  }, []);

  function decide(choice: "accepted" | "rejected") {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      /* ignore */
    }
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "cookie_consent", consent: choice });
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      style={{
        position: "fixed",
        left: "1rem",
        right: "1rem",
        bottom: "1rem",
        zIndex: 1000,
        maxWidth: "44rem",
        margin: "0 auto",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "0.9rem",
        padding: "1rem 1.2rem",
        borderRadius: "16px",
        background: "rgba(10, 37, 64, 0.92)",
        border: "1px solid rgba(201, 169, 110, 0.35)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
        color: "#F7F4EF",
      }}
    >
      <p style={{ margin: 0, flex: "1 1 260px", fontSize: "0.9rem", lineHeight: 1.5 }}>
        Usamos cookies para análise, quando configurada, e para a publicidade do Google
        AdSense. Você pode aceitar ou recusar os cookies não essenciais. Leia a{" "}
        <Link href="/cookies" style={{ color: "#E8C47C", textDecoration: "underline" }}>
          Política de Cookies
        </Link>{" "}
        e a{" "}
        <Link href="/privacidade" style={{ color: "#E8C47C", textDecoration: "underline" }}>
          Política de Privacidade
        </Link>
        .
      </p>
      <div style={{ display: "flex", gap: "0.6rem", flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => decide("rejected")}
          style={{
            padding: "0.55rem 1.1rem",
            borderRadius: "100px",
            border: "1px solid rgba(247, 244, 239, 0.4)",
            background: "transparent",
            color: "#F7F4EF",
            fontSize: "0.85rem",
            cursor: "pointer",
          }}
        >
          Recusar
        </button>
        <button
          type="button"
          onClick={() => decide("accepted")}
          style={{
            padding: "0.55rem 1.3rem",
            borderRadius: "100px",
            border: "none",
            background: "linear-gradient(135deg, #C9A96E, #E8C47C)",
            color: "#0A2540",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Aceitar
        </button>
      </div>
    </div>
  );
}
