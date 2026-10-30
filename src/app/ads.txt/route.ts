import { ADSENSE_CLIENT_ID } from "@/lib/site";

export const revalidate = 600;

/**
 * ads.txt do Google AdSense.
 * O ID de certificação f08c47fec0942fa0 é o publicado pelo Google
 * para a linha oficial google.com / DIRECT.
 * https://support.google.com/adsense/answer/12171612
 */
export function GET() {
  const pub = ADSENSE_CLIENT_ID.replace(/^ca-/, "");
  const body = `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
