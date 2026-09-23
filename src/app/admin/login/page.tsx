"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.get("username"),
        password: form.get("password"),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError("Usuário ou senha inválidos.");
      return;
    }
    if (data.mustChangePassword) {
      router.push("/admin/alterar-senha");
    } else {
      router.push("/admin");
    }
    router.refresh();
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo" style={{ marginBottom: "0.5rem" }}>
          SAÚDE <em>INTEGRAL</em>
        </div>
        <h1 style={{ fontFamily: "var(--font-serif)", marginTop: 0 }}>Painel CMS</h1>
        <p style={{ color: "var(--text-muted)" }}>
          Entre para publicar artigos, gerar capas com IA e gerenciar o portal.
        </p>
        <form className="admin-form" onSubmit={onSubmit}>
          <label>
            Usuário ou e-mail
            <input
              name="username"
              autoComplete="username"
              required
              defaultValue="antonio.ptp2011@gmail.com"
            />
          </label>
          <label>
            Senha
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Sua senha"
            />
          </label>
          {error && <p style={{ color: "#b42318", margin: 0 }}>{error}</p>}
          <button className="btn btn--primary" type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
          <Link href="/admin/recuperar-senha">Esqueci minha senha</Link>
        </p>
      </div>
    </div>
  );
}
