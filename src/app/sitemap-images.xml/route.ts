import { getArticleSummaries } from "@/lib/articles";
import { siteConfig } from "@/lib/site";

export const revalidate = 300;

export async function GET() {
  const articles = await getArticleSummaries();
  const urls = articles
    .map((a) => {
      const imageUrl = a.coverImage.startsWith("http")
        ? a.coverImage
        : `${siteConfig.url}${a.coverImage}`;
      return `
  <url>
    <loc>${siteConfig.url}/artigos/${a.slug}</loc>
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title><![CDATA[${a.title}]]></image:title>
      <image:caption><![CDATA[${a.coverAlt || a.title}]]></image:caption>
    </image:image>
  </url>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=300, stale-while-revalidate",
    },
  });
}
