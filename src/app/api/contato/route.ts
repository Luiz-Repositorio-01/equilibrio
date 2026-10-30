import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { saveContactMessage } from "@/lib/cms";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(20).max(4000),
  website: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    if (body.website?.trim()) {
      return NextResponse.json({ ok: true });
    }
    const saved = await saveContactMessage({
      name: body.name,
      email: body.email,
      subject: body.subject,
      message: body.message,
    });
    if (!saved.ok) {
      return NextResponse.json(
        { error: "Não foi possível registrar a mensagem neste momento." },
        { status: 503 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Confira nome, e-mail, assunto e uma mensagem com pelo menos 20 caracteres." },
      { status: 400 }
    );
  }
}
