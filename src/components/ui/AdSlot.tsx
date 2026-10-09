import { getMonetization, hydrateMonetization } from "@/lib/monetization";
import { getAdSlots } from "@/lib/cms";
import { analyticsConfig } from "@/lib/site";

const ADSENSE_STATUS_LABEL: Record<string, string> = {
  nao_configurado: "Não configurado",
  em_analise: "Em análise",
  aprovado: "Aprovado",
  ativo: "Ativo",
};

export async function AdSlot({
  id,
  label = "Espaço publicitário",
  minHeight = 90,
}: {
  id: string;
  label?: string;
  minHeight?: number;
}) {
  await hydrateMonetization();
  const monetization = getMonetization();
  const slots = await getAdSlots();
  const slot = slots.find((s) => s.id === id);
  const enabled = slot?.enabled !== false;
  const adsense = monetization.adsense;
  const clientId = adsense.clientId || analyticsConfig.adsenseClient || "";

  if (!enabled) return null;

  // Render real AdSense unit placeholder when configured & active
  if (
    (slot?.provider === "adsense" || !slot) &&
    clientId &&
    (adsense.status === "ativo" || adsense.status === "aprovado")
  ) {
    return (
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
  }

  return (
    <aside
      className="ad-slot"
      aria-label={label}
      data-ad-slot={id}
      data-ad-provider={slot?.provider || "adsense"}
      style={{ minHeight }}
    >
      <div>
        <strong>{label}</strong>
        <div>
          {adsense.status === "nao_configurado"
            ? "Configure o AdSense na Central de Monetização"
            : `Status AdSense: ${ADSENSE_STATUS_LABEL[adsense.status] || adsense.status}`}
        </div>
        <div style={{ opacity: 0.7, marginTop: 4 }}>slot: {id}</div>
      </div>
    </aside>
  );
}
