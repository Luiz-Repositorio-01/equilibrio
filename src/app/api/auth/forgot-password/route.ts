import { NextRequest, NextResponse } from "next/server";
import { createPasswordResetToken, ensureBootstrapAdmin } from "@/lib/users";
import { siteConfig } from "@/lib/site";
import { passwordResetEmailHtml, sendEmail } from "@/lib/mail";

/**
 * Gera token de recuperação e envia e-mail.
 * Preferência: Resend. Fallback: entrega via navegador (FormSubmit),
 * porque o FormSubmit bloqueia IPs da Vercel com Cloudflare.
 */
export async function POST(req: NextRequest) {
  try {
    await ensureBootstrapAdmin();
    const { email } = await req.json();
    const result = await createPasswordResetToken(String(email || ""));

    const base = {
      ok: true,
      message:
        "Se o e-mail existir em nossa base, enviamos um link de recuperação. Verifique a caixa de entrada e o spam.",
    };

    if (!result) return NextResponse.json(base);

    const resetUrl = `${siteConfig.url}/admin/redefinir-senha?token=${encodeURIComponent(result.token)}`;
    const text = `Redefina sua senha neste link (válido por 1 hora): ${resetUrl}`;
    const subject = `${siteConfig.name} — recuperação de senha`;

    if (process.env.RESEND_API_KEY?.trim()) {
      try {
        await sendEmail({
          to: result.user.email,
          subject,
          html: passwordResetEmailHtml(resetUrl),
          text,
        });
        return NextResponse.json(base);
      } catch (err) {
        console.error("[forgot-password] Resend falhou:", err);
        return NextResponse.json(
          {
            ok: false,
            error:
              err instanceof Error
                ? err.message
                : "Falha ao enviar e-mail de recuperação.",
          },
          { status: 503 }
        );
      }
    }

    // Sem Resend: o front envia pelo navegador (passa no Cloudflare do FormSubmit)
    return NextResponse.json({
      ok: true,
      message:
        "Prepare o envio do e-mail de recuperação. Se for a primeira vez, confirme o Activate Form na caixa de entrada e tente de novo.",
      browserDelivery: {
        to: result.user.email,
        subject,
        message: text,
        link: resetUrl,
      },
    });
  } catch (e) {
    console.error("[forgot-password] erro:", e);
    return NextResponse.json(
      {
        error: "Erro ao solicitar recuperação",
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}
