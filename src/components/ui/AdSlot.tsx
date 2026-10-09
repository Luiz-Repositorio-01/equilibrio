import { getMonetization, hydrateMonetization } from "@/lib/monetization";
import { getAdSlots } from "@/lib/cms";
import { analyticsConfig } from "@/lib/site";

/**
 * Só renderiza quando há anúncio real (AdSense aprovado/ativo). Sem isso não
 * aparece nada — nem moldura nem aviso "configure o AdSense" (a configuração
 * continua na Central de Monetização do admin).
 * `frame` embrulha o anúncio na moldura da home e some junto com ele.
 */
export async function AdSlot({
  id,
  label = "Espaço publicitário",
  minHeight = 90,
  frame,
}: {
  id: string;
  label?: string;
  minHeight?: number;
  frame?: "home-top" | "home";
}) {
  await hydrateMonetization();
  const monetization = getMonetization();
  const slots = await getAdSlots();
  const slot = slots.find((s) => s.id === id);
  const adsense = monetization.adsense;
  const clientId = adsense.clientId || analyticsConfig.adsenseClient || "";

  const live =
    slot?.enabled !== false &&
    (slot?.provider === "adsense" || !slot) &&
    Boolean(clientId) &&
    (adsense.status === "ativo" || adsense.status === "aprovado");
  if (!live) return null;

  const unit = (
    <aside
      className="ad-slot ad-slot--live"
      aria-label={label}
      data-ad-slot={id}
      data-ad-provider="adsense"
      data-ad-client={clientId}
      style={{ minHeight }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={id}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <div className="ad-slot__fallback">
        <strong>{label}</strong>
        <div>AdSense · {clientId}</div>
      </div>
    </aside>
  );

  if (frame === "home-top") {
    return (
      <div className="cinema-container" style={{ paddingBlock: "0.5rem 0.75rem" }}>
        <div className="ad-cinema">{unit}</div>
      </div>
    );
  }
  if (frame === "home") return <div className="ad-cinema">{unit}</div>;
  return unit;
}
