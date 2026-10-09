import type { Metadata } from "next";
import { Suspense } from "react";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AnalyticsProvider } from "@/components/providers/AnalyticsProvider";
import { SiteShell } from "@/components/layout/SiteShell";
import { siteConfig, analyticsConfig } from "@/lib/site";
import { buildWebsiteJsonLd } from "@/lib/seo";
import { getMonetization, hydrateMonetization } from "@/lib/monetization";
import "./globals.css";
import "./cinematic.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Corpo, Mente e Espírito`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.author }],
  keywords: [
    "saúde integral",
    "equilíbrio",
    "bem-estar",
    "saúde mental",
    "meditação",
    "ansiedade",
    "espiritualidade",
    "qualidade de vida",
    "desenvolvimento pessoal",
  ],
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [{ url: siteConfig.logo, width: 512, height: 512 }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.logo],
  },
  robots: { index: true, follow: true },
  verification: analyticsConfig.searchConsoleVerification
    ? { google: analyticsConfig.searchConsoleVerification }
    : undefined,
  alternates: { canonical: siteConfig.url, types: { "application/rss+xml": "/rss.xml" } },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = buildWebsiteJsonLd();
  await hydrateMonetization();
  const adsense = getMonetization().adsense;
  const adsenseClient = adsense.clientId || analyticsConfig.adsenseClient || "";

  return (
    <html lang="pt-BR" data-theme="dark" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content={siteConfig.themeColor} />
        <link rel="icon" href="/assets/brand/logo-saude-integral.png" type="image/png" />
        <link rel="apple-touch-icon" href="/assets/brand/logo-saude-integral.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${display.variable} ${body.variable}`}>
        <ThemeProvider>
          <Suspense fallback={null}>
            <AnalyticsProvider adsenseClient={adsenseClient}>
              <SiteShell>{children}</SiteShell>
            </AnalyticsProvider>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
