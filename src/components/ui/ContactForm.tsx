"use client";

import { useState } from "react";
import { siteConfig } from "@/lib/site";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (String(data.get("website") || "").trim()) {
      setStatus("sent");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("nome"),
          email: data.get("email"),
          subject: data.get("assunto"),
          message: data.get("mensagem"),
        }),
      });
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setStatus("error");
        setError(payload?.error || "Não foi possível enviar agora.");
        return;
      }
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
      setError("Não foi possível enviar agora.");
    }
  }

  return (
    <form className="admin-form" style={{ marginTop: "1.5rem" }} onSubmit={onSubmit}>
      <label>
        Nome
        <input name="nome" required minLength={2} maxLength={80} placeholder="Seu nome" />
      </label>
      <label>
        E-mail
        <input type="email" name="email" required maxLength={120} placeholder="voce@email.com" />
      </label>
      <label>
        Assunto
        <input name="assunto" required minLength={3} maxLength={120} placeholder="Pauta, correção, parceria ou dúvida" />
      </label>
      <label>
        Mensagem
        <textarea name="mensagem" rows={6} required minLength={20} maxLength={4000} placeholder="Escreva sua mensagem" />
      </label>
      <label className="contact-honeypot" aria-hidden="true">
        Site
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <button className="btn btn--primary" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Enviando…" : "Enviar mensagem"}
      </button>
      {status === "sent" && (
        <p role="status">
          Mensagem registrada. Se precisar de resposta direta, escreva também para{" "}
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
        </p>
      )}
      {status === "error" && (
        <p role="alert">
          {error} Use o e-mail{" "}
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
        </p>
      )}
    </form>
  );
}
