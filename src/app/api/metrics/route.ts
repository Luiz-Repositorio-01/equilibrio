import { NextRequest, NextResponse } from "next/server";
import { getKnownSlugs, getMetrics, trackMetricEvent } from "@/lib/cms";
import { isAuthenticated } from "@/lib/auth";

const BOT_UA = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|monitor|curl|wget|python|node-fetch|axios|java|go-http|facebookexternalhit|whatsapp|telegram/i;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || "event");

    // Só tráfego humano real conta: ignora robôs e as visitas do próprio admin.
    const ua = req.headers.get("user-agent") || "";
    if (!ua || BOT_UA.test(ua)) return NextResponse.json({ ok: true, ignored: "bot" });
    if (req.cookies.get("ei_admin_session")?.value) {
      return NextResponse.json({ ok: true, ignored: "admin" });
    }

    // O artigo vem do endereço da página (/artigos/<slug>), nunca de dados soltos do navegador.
    let slug: string | undefined;
    const path = typeof body.path === "string" ? body.path : "";
    const m = path.match(/^\/artigos\/([a-z0-9-]{1,120})\/?$/);
    if (m) {
      if ((await getKnownSlugs()).has(m[1])) slug = m[1];
    }
    await trackMetricEvent(name, { path, slug });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  return NextResponse.json(await getMetrics());
}
