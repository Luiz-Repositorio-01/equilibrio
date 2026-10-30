import type { MetadataRoute } from "next";
import { getAllCategories, getAllTags, getArticleSummaries } from "@/lib/articles";
import { EDITORIAL_REVISION } from "@/lib/editorial";
import { siteConfig } from "@/lib/site";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getArticleSummaries();
  const categories = await getAllCategories();
  const tags = await getAllTags();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/artigos",
    "/sobre",
    "/contato",
    "/privacidade",
    "/cookies",
    "/termos",
    "/editorial",
  ].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  return [
    ...staticRoutes,
    ...categories.map((c) => ({
      url: `${siteConfig.url}/categoria/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...tags
      .filter((t) => t.count >= 3)
      .map((t) => ({
      url: `${siteConfig.url}/tag/${encodeURIComponent(t.tag)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
    ...articles.map((a) => ({
      url: `${siteConfig.url}/artigos/${a.slug}`,
      lastModified: new Date(
        [a.updatedAt, a.publishedAt, EDITORIAL_REVISION].filter(Boolean).sort().at(-1) ||
          a.publishedAt
      ),
      changeFrequency: "monthly" as const,
      priority: a.featured ? 0.9 : 0.75,
    })),
  ];
}
