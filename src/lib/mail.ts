import { siteConfig } from "./site";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

/**
 * Envio server-side via Resend (quando RESEND_API_KEY estiver na Vercel).
 * Sem a chave, a recuperação usa envio pelo navegador (FormSubmit) na página.
 */
export async function sendEmail(input: SendEmailInput): Promise<{ ok: true; provider: string }> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (!resendKey) {
    throw new Error("RESEND_API_KEY não configurada");
  }

  const from =
    process.env.MAIL_FROM?.trim() || "SAÚDE INTEGRAL <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Falha ao enviar e-mail (Resend): ${detail || res.status}`);
  }

  return { ok: true, provider: "resend" };
}

export function passwordResetEmailHtml(resetUrl: string) {
  return `
  <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:24px;color:#1a1a1a">
    <h1 style="font-size:22px;margin:0 0 12px">Recuperação de senha</h1>
    <p style="line-height:1.5;margin:0 0 16px">
      Você solicitou a redefinição da senha do painel CMS do <strong>${siteConfig.name}</strong>.
    </p>
    <p style="margin:0 0 20px">
      <a href="${resetUrl}" style="display:inline-block;background:#0D4A4A;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px">
        Redefinir senha
      </a>
    </p>
    <p style="font-size:13px;color:#555;line-height:1.5;margin:0 0 8px">
      Se o botão não funcionar, copie e cole este link no navegador:
    </p>
    <p style="font-size:12px;word-break:break-all;color:#0D4A4A">${resetUrl}</p>
    <p style="font-size:12px;color:#777;margin-top:24px">
      O link expira em 1 hora. Se você não solicitou isso, ignore este e-mail.
    </p>
  </div>`;
}
