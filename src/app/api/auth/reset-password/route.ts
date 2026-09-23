import { NextRequest, NextResponse } from "next/server";
import { forceSetPassword, getUserByResetToken } from "@/lib/users";

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();
    const user = await getUserByResetToken(String(token || ""));
    if (!user) {
      return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 400 });
    }
    await forceSetPassword(user.id, String(newPassword || ""));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao redefinir senha" },
      { status: 400 }
    );
  }
}
