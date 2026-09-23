import { siteConfig } from "./site";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export type SendEmailResult = {
  ok: true;
  provider: string;
  note?: string;
};

/**
 * Envia e-mail real:
 * 1) Resend (se RESEND_API_KEY existir)
 * 2) FormSubmit para o e-mail de destino (sem API key; 1ª vez exige confirmação no e-mail)
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (resendKey) {
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

  const origin = (process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url).replace(/\/$/, "");
  const endpoint = `https://formsubmit.co/ajax/${encodeURIComponent(input.to)}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Origin: origin,
      Referer: `${origin}/admin/recuperar-senha`,
      "User-Agent":
        "Mozilla/5.0 (compatible; SaudeIntegralCMS/1.0; +https://www.equilibriointegral.com.br)",
    },
    body: JSON.stringify({
      _subject: input.subject,
      _template: "box",
      _captcha: "false",
      message: input.text || input.html.replace(/<[^>]+>/g, " "),
      link: input.text?.match(/https?:\/\/\S+/)?.[0] || "",
      site: siteConfig.name,
    }),
  });

  const raw = await res.text().catch(() => "");
  console.info("[mail] FormSubmit status=", res.status, "body=", raw.slice(0, 500));

  let parsed: { success?: string | boolean; message?: string } = {};
  try {
    parsed = JSON.parse(raw) as typeof parsed;
  } catch {
    parsed = {};
  }

  const okFlag = parsed.success === true || parsed.success === "true";
  const msg = String(parsed.message || raw || "");
  const activationPending = /activat/i.test(msg);

  if (activationPending) {
    return {
      ok: true,
      provider: "formsubmit-activation",
      note: msg,
    };
  }

  if (okFlag || res.ok) {
    return { ok: true, provider: "formsubmit" };
  }

  throw new Error(`Falha ao enviar e-mail (FormSubmit): ${msg || res.status}`);
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
