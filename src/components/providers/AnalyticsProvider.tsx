"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { analyticsConfig } from "@/lib/site";

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(
  name: string,
  params: Record<string, string | number | boolean | undefined> = {}
) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  const payload = {
    event: name,
    ...params,
    page_path: window.location.pathname,
    page_location: window.location.href,
    timestamp: Date.now(),
  };
  window.dataLayer.push(payload);
  if (typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }

  // Visualização: conta cada página só uma vez por sessão (recarregar não infla o número).
  if (name === "page_view") {
    try {
      const key = "pv:" + window.location.pathname;
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      /* sem sessionStorage: conta mesmo assim */
    }
  }

  // Mirror key events to CMS metrics (best-effort)
  if (
    ["page_view", "newsletter_signup", "article_open", "share", "cta_click"].includes(
      name
    )
  ) {
    fetch("/api/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        path: window.location.pathname,
        slug: typeof params.slug === "string" ? params.slug : undefined,
      }),
    }).catch(() => undefined);
  }
}

export function AnalyticsProvider({
  children,
  adsenseClient,
}: {
  children: React.ReactNode;
  /** Client ID from CMS monetization (falls back to env inside). */
  adsenseClient?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const readingStart = useRef<number>(Date.now());
  const maxScroll = useRef(0);
  const fired = useRef<Set<number>>(new Set());
  const resolvedAdsense =
    (adsenseClient || analyticsConfig.adsenseClient || "").trim();

  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      "gtm.start": Date.now(),
      event: "gtm.js",
    });

    if (analyticsConfig.gtmId) {
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtm.js?id=${analyticsConfig.gtmId}`;
      document.head.appendChild(s);
    }

    if (analyticsConfig.ga4Id) {
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsConfig.ga4Id}`;
      document.head.appendChild(s);
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer.push(args as unknown as Record<string, unknown>);
      };
      window.gtag("js", new Date());
      window.gtag("config", analyticsConfig.ga4Id, { send_page_view: false });
    }

    if (resolvedAdsense) {
      const existing = document.querySelector(
        'script[src*="pagead2.googlesyndication.com"]'
      );
      if (!existing) {
        const s = document.createElement("script");
        s.async = true;
        s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${resolvedAdsense}`;
        s.crossOrigin = "anonymous";
        document.head.appendChild(s);
      }
    }
  }, [resolvedAdsense]);

  useEffect(() => {
    readingStart.current = Date.now();
    maxScroll.current = 0;
    fired.current = new Set();
    trackEvent("page_view", {
      page_title: document.title,
      page_search: searchParams?.toString() || "",
    });
  }, [pathname, searchParams]);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY;
      const height = doc.scrollHeight - window.innerHeight;
      if (height <= 0) return;
      const pct = Math.round((scrollTop / height) * 100);
      maxScroll.current = Math.max(maxScroll.current, pct);
      for (const mark of [25, 50, 75, 100]) {
        if (pct >= mark && !fired.current.has(mark)) {
          fired.current.add(mark);
          trackEvent("scroll", { percent: mark });
          trackEvent(`scroll_${mark}` as "scroll", { percent: mark });
          if (mark === 100) trackEvent("article_finish");
        }
      }
    };

    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest<HTMLElement>("[data-track]");
      if (!target) {
        const anchor = (e.target as HTMLElement)?.closest("a");
        if (anchor?.href && anchor.host !== window.location.host) {
          trackEvent("external_click", { url: anchor.href });
        }
        return;
      }
      trackEvent(target.dataset.track || "cta_click", {
        label: target.dataset.trackLabel || target.innerText.slice(0, 80),
        slug: target.dataset.trackSlug,
      });
    };

    const readingTimer = window.setInterval(() => {
      const seconds = Math.round((Date.now() - readingStart.current) / 1000);
      if (seconds > 0 && seconds % 30 === 0) {
        trackEvent("reading_time", { seconds, max_scroll: maxScroll.current });
      }
    }, 1000);

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick);
      window.clearInterval(readingTimer);
    };
  }, [pathname]);

  return <>{children}</>;
}
