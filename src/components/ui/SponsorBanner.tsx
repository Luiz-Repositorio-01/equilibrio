import { getActiveBanners, hydrateMonetization } from "@/lib/monetization";

export async function SponsorBanner({ position = "sponsor" }: { position?: string }) {
  await hydrateMonetization();
  const banners = getActiveBanners(position);
  const banner = banners[0];

  if (!banner) {
    // Sem banner cadastrado não mostra nada ao público.
    return null;
  }

  return (
    <aside className="sponsor" data-sponsor-slot="true" aria-label="Patrocinado">
      <div className="meta" style={{ marginBottom: "0.5rem" }}>
        <span className="pill">Patrocinado</span>
      </div>
      <a
        href={banner.linkUrl || "#"}
        target="_blank"
        rel="noopener noreferrer sponsored"
        data-track="cta_click"
        data-track-label={`banner:${banner.id}`}
      >
        {banner.imageUrl ? (
          // External/partner creatives often use absolute URLs outside next/image domains
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={banner.imageUrl}
            alt={banner.title || "Banner patrocinado"}
            style={{ width: "100%", borderRadius: 12, display: "block" }}
          />
        ) : (
          <h3 style={{ margin: 0 }}>{banner.title}</h3>
        )}
      </a>
    </aside>
  );
}
