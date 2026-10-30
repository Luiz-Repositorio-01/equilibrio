import type { Metadata } from "next";
import type { Article } from "./types";
import { siteConfig } from "./site";

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}

export function buildPageMetadata({
  title,
  description,
  path = "/",
  image,
  type = "website",
  keywords,
  publishedTime,
  modifiedTime,
  authorName,
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  authorName?: string;
}): Metadata {
  const url = absoluteUrl(path);
  const ogImage = absoluteUrl(image || "/assets/hero-bg.png");

  return {
    title,
    description,
    keywords: keywords?.join(", "),
    authors: [{ name: authorName || siteConfig.author }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    alternates: { canonical: url },
    openGraph: {
      type,
      locale: siteConfig.locale,
      url,
      title,
      description,
      siteName: siteConfig.name,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      ...(type === "article"
        ? {
            publishedTime,
            modifiedTime,
            authors: authorName ? [authorName] : undefined,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
}

export function buildArticleJsonLd(article: Article) {
  const url = absoluteUrl(`/artigos/${article.slug}`);
  const image = absoluteUrl(article.coverImage);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Article", "BlogPosting"],
        "@id": `${url}#article`,
        headline: article.title,
        alternativeHeadline: article.subtitle,
        description: article.seo.description,
        image: {
          "@type": "ImageObject",
          url: image,
          caption: article.coverAlt,
        },
        datePublished: article.publishedAt,
        dateModified: article.updatedAt,
        author: {
          "@type": "Person",
          name: article.author,
          url: absoluteUrl("/sobre"),
        },
        publisher: {
          "@type": "Organization",
          name: siteConfig.name,
          logo: {
            "@type": "ImageObject",
            url: absoluteUrl("/assets/favicon.svg"),
          },
        },
        mainEntityOfPage: url,
        articleSection: article.category,
        keywords: article.tags.join(", "),
        wordCount: article.contentText?.split(/\s+/).length || undefined,
        timeRequired: `PT${article.readingTime}M`,
        inLanguage: siteConfig.language,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: absoluteUrl("/") },
          {
            "@type": "ListItem",
            position: 2,
            name: article.category,
            item: absoluteUrl(`/categoria/${article.categorySlug}`),
          },
          { "@type": "ListItem", position: 3, name: article.title, item: url },
        ],
      },
      ...(article.faq?.length
        ? [
            {
              "@type": "FAQPage",
              mainEntity: article.faq.map((f) => ({
                "@type": "Question",
                name: f.question,
                acceptedAnswer: { "@type": "Answer", text: f.answer },
              })),
            },
          ]
        : []),
    ],
  };
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteConfig.url}/#organization`,
        name: siteConfig.name,
        url: siteConfig.url,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/assets/favicon.svg"),
        },
        description: siteConfig.description,
        sameAs: Object.values(siteConfig.social),
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          email: siteConfig.email,
          availableLanguage: "Portuguese",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        url: siteConfig.url,
        name: siteConfig.name,
        publisher: { "@id": `${siteConfig.url}/#organization` },
        inLanguage: siteConfig.language,
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteConfig.url}/busca?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}
