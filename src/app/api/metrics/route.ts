import { NextRequest, NextResponse } from "next/server";
import { getMetrics, trackMetricEvent } from "@/lib/cms";
import { isAuthenticated } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || "event");
    await trackMetricEvent(name, { path: body.path, slug: body.slug });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getMetrics());
}
