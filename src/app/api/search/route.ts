import { NextRequest, NextResponse } from "next/server";
import { searchArticles } from "@/lib/articles";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  const results = (await searchArticles(q)).slice(0, 12).map((a) => ({
    slug: a.slug,
    title: a.title,
    category: a.category,
    excerpt: a.excerpt,
  }));
  return NextResponse.json({ results });
}
