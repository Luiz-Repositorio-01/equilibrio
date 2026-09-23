"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type BrowserDelivery = {
  to: string;
  subject: string;
  message: string;
  link: string;
};

async function sendViaBrowserFormSubmit(delivery: BrowserDelivery) {
  const origin = window.location.origin;
  const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(delivery.to)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      _subject: delivery.subject,
      _template: "box",
      _captcha: "false",
      _next: `${origin}/admin/login`,
      message: delivery.message,
      link: delivery.link,
      site: "SAÚDE INTEGRAL",
    }),
  });
  const raw = await res.text();
  let parsed: { success?: string | boolean; message?: string } = {};
  try {
    parsed = JSON.parse(raw) as typeof parsed;
  } catch {
    parsed = {};
  }
  const msg = String(parsed.message || raw || "");
  if (/activat/i.test(msg)) {
    return {
      ok: true as const,
      activation: true,
      message:
        "Enviamos um e-mail de ativação. Abra a caixa de entrada, clique em Activate Form e solicite a recuperação novamente.",
    };
  }
  const ok = parsed.success === true || parsed.success === "true" || res.ok;
  if (!ok) {
    throw new Error(msg || "Falha ao enviar e-mail pelo navegador.");
  }
  return {
    ok: true as const,
    activation: false,
    message:
      "E-mail enviado. Verifique a caixa de entrada (e o spam) com o link para redefinir a senha.",
  };
}

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email") }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || data.detail || "Não foi possível solicitar a recuperação.");
        setLoading(false);
        return;
      }

      if (data.browserDelivery) {
        const sent = await sendViaBrowserFormSubmit(data.browserDelivery as BrowserDelivery);
        setMessage(sent.message);
      } else {
        setMessage(data.message || "Solicitação enviada.");
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro ao enviar recuperação.");
    }
    setLoading(false);
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 style={{ fontFamily: "var(--font-serif)", marginTop: 0 }}>Recuperar senha</h1>
        <p style={{ color: "var(--text-muted)" }}>
          Informe o e-mail do administrador. Enviaremos um link real para redefinir a senha.
        </p>
        <form className="admin-form" onSubmit={onSubmit}>
          <label>
            E-mail
            <input
              name="email"
              type="email"
              required
              defaultValue="antonio.ptp2011@gmail.com"
            />
          </label>
          <button className="btn btn--primary" type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar link de recuperação"}
          </button>
        </form>
        {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
        <p>
          <Link href="/admin/login">Voltar ao login</Link>
        </p>
      </div>
    </div>
  );
}
