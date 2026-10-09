import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  getSession,
  setSessionCookie,
} from "@/lib/auth";
import { changePassword, getUserById } from "@/lib/users";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await req.json();
    if (!newPassword || String(newPassword).length < 10) {
      return NextResponse.json(
        { error: "A nova senha deve ter ao menos 10 caracteres" },
        { status: 400 }
      );
    }

    await changePassword(session.uid, String(currentPassword || ""), String(newPassword));
    const user = getUserById(session.uid);
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const token = await createSessionToken(user);
    await setSessionCookie(token);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao alterar senha" },
      { status: 400 }
    );
  }
}
