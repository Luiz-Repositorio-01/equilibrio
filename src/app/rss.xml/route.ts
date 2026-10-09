import { getArticleSummaries } from "@/lib/articles";
import { siteConfig } from "@/lib/site";

export const revalidate = 300;

export async function GET() {
  const articles = await (await getArticleSummaries()).slice(0, 50);
  const items = articles
    .map(
      (a) => `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${siteConfig.url}/artigos/${a.slug}</link>
      <guid>${siteConfig.url}/artigos/${a.slug}</guid>
      <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
      <description><![CDATA[${a.excerpt}]]></description>
      <category><![CDATA[${a.category}]]></category>
      <author>${siteConfig.email} (${a.author})</author>
    </item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteConfig.name}</title>
    <link>${siteConfig.url}</link>
    <description>${siteConfig.description}</description>
    <language>pt-BR</language>
    <atom:link href="${siteConfig.url}/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=300, stale-while-revalidate",
    },
  });
}
