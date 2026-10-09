import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import {
  flushMonetization,
  formatBRL,
  getMonetization,
  getRevenueDashboard,
  hydrateMonetization,
  syncSetupProgress,
} from "@/lib/monetization";
import { StatusBadge } from "@/components/admin/StatusBadge";

export default async function MonetizacaoHubPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");
  await hydrateMonetization();
  await syncSetupProgress();
  await flushMonetization();
  const state = getMonetization();
  const revenue = await getRevenueDashboard();
  const setupDone = Object.values(state.setup.steps).filter(Boolean).length;
  const setupTotal = Object.keys(state.setup.steps).length;

  const cards = [
    {
      href: "/admin/monetizacao/adsense",
      title: "Google AdSense",
      desc: "Publisher ID, Client ID, script e status",
      meta: <StatusBadge status={state.adsense.status} />,
    },
    {
      href: "/admin/monetizacao/ad-manager",
      title: "Google Ad Manager",
      desc: "Network ID, tags e blocos de anúncio",
      meta: state.adManager.networkId || "Não configurado",
    },
    {
      href: "/admin/monetizacao/afiliados",
      title: "Afiliados",
      desc: "Amazon, Hotmart, Eduzz, Shopee e outros",
      meta: `${state.affiliates.filter((a) => a.active).length} ativos`,
    },
    {
      href: "/admin/monetizacao/redes",
      title: "Redes de anúncios",
      desc: "Ezoic, Mediavine, Raptive, Taboola...",
      meta: `${state.networks.filter((n) => n.status !== "nao_configurado").length} conectadas`,
    },
    {
      href: "/admin/monetizacao/banners",
      title: "Banners",
      desc: "Imagem, link, período, posição e prioridade",
      meta: `${state.banners.filter((b) => b.active).length} ativos`,
    },
    {
      href: "/admin/monetizacao/financeiro",
      title: "PIX e dados bancários",
      desc: "Organização administrativa (privado)",
      meta: state.banking.pixKey ? "Cadastrado" : "Pendente",
    },
    {
      href: "/admin/monetizacao/receita",
      title: "Painel de receita",
      desc: "RPM, CTR, origem e lançamentos manuais",
      meta: formatBRL(revenue.estimatedRevenue),
    },
    {
      href: "/admin/assistente",
      title: "Assistente de configuração",
      desc: "Guia completo para deixar o portal pronto",
      meta: `${setupDone}/${setupTotal} etapas`,
    },
  ];

  return (
    <div style={{ display: "grid", gap: "1.2rem" }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-serif)", margin: 0 }}>Central de Monetização</h1>
        <p style={{ color: "var(--text-muted)", maxWidth: "46rem" }}>
          Cadastre as contas que recebem pagamentos nas plataformas. O site{" "}
          <strong>não recebe dinheiro</strong> — ele apenas integra AdSense, afiliados e redes,
          enviando visitantes, cliques e conversões.
        </p>
      </div>

      <div className="admin-card" style={{ background: "rgba(10,37,64,0.04)" }}>
        <h2 style={{ fontFamily: "var(--font-serif)", marginTop: 0 }}>Configuração de pagamentos</h2>
        <p style={{ margin: 0, color: "var(--text-muted)" }}>
          Os pagamentos são feitos <strong>diretamente pelas plataformas de monetização</strong> para
          a conta cadastrada por você nelas (AdSense, Hotmart, Amazon etc.). Este CMS apenas organiza
          IDs, scripts, banners e o acompanhamento de receita estimada.
        </p>
      </div>

      <div className="admin-stats">
        <div className="admin-card">
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Receita estimada</div>
          <strong style={{ fontSize: "1.5rem" }}>{formatBRL(revenue.estimatedRevenue)}</strong>
        </div>
        <div className="admin-card">
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>CTR</div>
          <strong style={{ fontSize: "1.5rem" }}>{revenue.ctr}%</strong>
        </div>
        <div className="admin-card">
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>RPM / eCPM</div>
          <strong style={{ fontSize: "1.5rem" }}>{formatBRL(revenue.rpm)}</strong>
        </div>
        <div className="admin-card">
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>AdSense</div>
          <div style={{ marginTop: "0.4rem" }}>
            <StatusBadge status={state.adsense.status} />
          </div>
        </div>
      </div>

      <div className="monetization-grid">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="admin-card monetization-card">
            <h3 style={{ fontFamily: "var(--font-serif)", margin: "0 0 0.4rem" }}>{card.title}</h3>
            <p style={{ color: "var(--text-muted)", margin: "0 0 0.8rem", fontSize: "0.92rem" }}>
              {card.desc}
            </p>
            <div style={{ fontWeight: 600 }}>{card.meta}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
