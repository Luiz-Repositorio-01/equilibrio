import { NextRequest, NextResponse } from "next/server";
import { createPasswordResetToken, ensureBootstrapAdmin } from "@/lib/users";
import { siteConfig } from "@/lib/site";
import { passwordResetEmailHtml, sendEmail } from "@/lib/mail";

/**
 * Gera token de recuperação e envia e-mail real (Resend).
 */
export async function POST(req: NextRequest) {
  try {
    await ensureBootstrapAdmin();
    const { email } = await req.json();
    const result = await createPasswordResetToken(String(email || ""));

    // Always same response to avoid user enumeration
    const base = {
      ok: true,
      message:
        "Se o e-mail existir em nossa base, enviamos um link de recuperação. Verifique a caixa de entrada e o spam.",
    };

    if (!result) return NextResponse.json(base);

    const resetUrl = `${siteConfig.url}/admin/redefinir-senha?token=${result.token}`;

    try {
      await sendEmail({
        to: result.user.email,
        subject: `${siteConfig.name} — recuperação de senha`,
        html: passwordResetEmailHtml(resetUrl),
        text: `Redefina sua senha neste link (válido por 1 hora): ${resetUrl}`,
      });
    } catch (err) {
      console.error("[forgot-password] e-mail falhou:", err);
      // Em desenvolvimento, ainda devolve o link para não bloquear o admin.
      if (process.env.NODE_ENV !== "production" || process.env.EXPOSE_RESET_TOKEN === "1") {
        return NextResponse.json({
          ...base,
          resetUrl,
          token: result.token,
          warning:
            err instanceof Error
              ? err.message
              : "Falha no envio de e-mail. Token exposto apenas fora de produção.",
        });
      }
      return NextResponse.json(
        {
          ok: false,
          error:
            "Não foi possível enviar o e-mail de recuperação. Verifique RESEND_API_KEY na Vercel.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(base);
  } catch {
    return NextResponse.json({ error: "Erro ao solicitar recuperação" }, { status: 500 });
  }
}
