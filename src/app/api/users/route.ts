import { NextRequest, NextResponse } from "next/server";
import { canManageUsers, getSession } from "@/lib/auth";
import {
  createUser,
  deleteUser,
  listUsers,
  updateUser,
  type UserRole,
} from "@/lib/users";

export async function GET() {
  const session = await getSession();
  if (!session || !canManageUsers(session.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  return NextResponse.json({ users: listUsers() });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !canManageUsers(session.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const user = await createUser({
      username: String(body.username || ""),
      email: String(body.email || ""),
      name: String(body.name || ""),
      role: (body.role || "author") as UserRole,
      password: String(body.password || "Temp@123456"),
      mustChangePassword: true,
    });
    return NextResponse.json({ user });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao criar usuário" },
      { status: 400 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || !canManageUsers(session.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const user = await updateUser(String(body.id), {
      email: body.email,
      name: body.name,
      role: body.role,
      active: body.active,
      mustChangePassword: body.mustChangePassword,
    });
    return NextResponse.json({ user });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao atualizar" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || !canManageUsers(session.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
    deleteUser(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao excluir" },
      { status: 400 }
    );
  }
}
