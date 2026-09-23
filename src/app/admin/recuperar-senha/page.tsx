"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setResetUrl("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email") }),
    });
    const data = await res.json();
    setLoading(false);
    setMessage(data.message || "Solicitação enviada.");
    if (data.resetUrl) setResetUrl(data.resetUrl);
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 style={{ fontFamily: "var(--font-serif)", marginTop: 0 }}>Recuperar senha</h1>
        <p style={{ color: "var(--text-muted)" }}>
          Informe o e-mail do administrador. Enviaremos um link real para redefinir a senha.
          Na primeira solicitação, confirme o ativador do FormSubmit na caixa de entrada.
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
        {resetUrl && (
          <p style={{ wordBreak: "break-all" }}>
            <Link href={resetUrl}>{resetUrl}</Link>
          </p>
        )}
        <p>
          <Link href="/admin/login">Voltar ao login</Link>
        </p>
      </div>
    </div>
  );
}
