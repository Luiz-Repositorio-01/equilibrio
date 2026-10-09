import { analyticsConfig } from "@/lib/site";
import { getMonetization, hydrateMonetization } from "@/lib/monetization";

export const revalidate = 600;

/**
 * ads.txt dinâmico para o Google AdSense.
 * Lê o publisher ID da monetização (CMS) ou da env NEXT_PUBLIC_ADSENSE_CLIENT.
 * Formato aceito: "ca-pub-XXXXXXXXXXXXXXXX".
 */
export async function GET() {
  await hydrateMonetization();
  const raw =
    (getMonetization().adsense?.clientId || analyticsConfig.adsenseClient || "").trim();
  // ads.txt usa "pub-XXXX" (sem o prefixo "ca-")
  const pub = raw.replace(/^ca-/, "");

  const body = pub
    ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`
    : "# Configure o publisher ID do AdSense (ex.: ca-pub-XXXXXXXXXXXXXXXX)\n# em NEXT_PUBLIC_ADSENSE_CLIENT ou na monetização do CMS para ativar o ads.txt.\n";

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
