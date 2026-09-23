"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const newPassword = String(form.get("newPassword") || "");
    const confirm = String(form.get("confirm") || "");
    if (newPassword !== confirm) {
      setLoading(false);
      setError("As senhas não coincidem.");
      return;
    }
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Token inválido.");
      return;
    }
    router.push("/admin/login");
  }

  return (
    <div className="login-card">
      <h1 style={{ fontFamily: "var(--font-serif)", marginTop: 0 }}>Redefinir senha</h1>
      {!token && <p style={{ color: "#b42318" }}>Token ausente. Solicite um novo link.</p>}
      <form className="admin-form" onSubmit={onSubmit}>
        <label>
          Nova senha
          <input name="newPassword" type="password" required minLength={8} />
        </label>
        <label>
          Confirmar
          <input name="confirm" type="password" required minLength={8} />
        </label>
        {error && <p style={{ color: "#b42318" }}>{error}</p>}
        <button className="btn btn--primary" type="submit" disabled={loading || !token}>
          {loading ? "Salvando..." : "Salvar senha"}
        </button>
      </form>
      <p>
        <Link href="/admin/login">Voltar ao login</Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="login-page">
      <Suspense fallback={<div className="login-card">Carregando…</div>}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
