import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";
import { getMetrics, getNewsletterLeads, listArticlesAdmin } from "@/lib/cms";
import {
  formatBRL,
  flushMonetization,
  getMonetization,
  getRevenueDashboard,
  hydrateMonetization,
  syncSetupProgress,
} from "@/lib/monetization";
import { StatusBadge } from "@/components/admin/StatusBadge";

export default async function AdminDashboardPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");

  await hydrateMonetization();
  const metrics = await getMetrics();
  const articles = await listArticlesAdmin();
  const leads = getNewsletterLeads();
  const setup = (await syncSetupProgress()).setup;
  await flushMonetization();
  const monetization = getMonetization();
  const revenue = await getRevenueDashboard();
  const published = articles.filter((a) => a.status === "published");
  const drafts = articles.filter((a) => a.status === "draft");
  const stale = published
    .filter((a) => {
      const days = (Date.now() - +new Date(a.updatedAt || a.publishedAt)) / 86400000;
      return days > 120;
    })
    .slice(0, 5);
  const setupDone = Object.values(setup.steps).filter(Boolean).length;
  const setupTotal = Object.keys(setup.steps).length;

  return (
    <div style={{ display: "grid", gap: "1.2rem" }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-serif)", margin: 0 }}>Painel</h1>
        <p style={{ color: "var(--text-muted)" }}>
          Visão geral de tráfego, engajamento, conteúdo e monetização.
        </p>
      </div>

      {!setup.completed && (
        <div className="admin-card wizard-success" style={{ background: "rgba(201,169,110,0.12)" }}>
          <h2 style={{ fontFamily: "var(--font-serif)", marginTop: 0 }}>
            Assistente de configuração — {setupDone}/{setupTotal}
          </h2>
          <p style={{ color: "var(--text-muted)" }}>
            Complete as etapas para deixar o portal pronto para visitantes e monetização.
          </p>
          <Link href="/admin/assistente" className="btn btn--primary">
            Continuar configuração
          </Link>
        </div>
      )}

      <div className="admin-card">
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-serif)", marginTop: 0 }}>Monetização</h2>
            <p style={{ color: "var(--text-muted)", margin: 0 }}>
              Receita estimada: <strong>{formatBRL(revenue.estimatedRevenue)}</strong>
              {" · "}
              AdSense: <StatusBadge status={monetization.adsense.status} />
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <Link href="/admin/monetizacao" className="btn btn--primary">
              Central de Monetização
            </Link>
            <Link href="/admin/monetizacao/receita" className="btn btn--outline">
              Receita
            </Link>
          </div>
        </div>
      </div>

      <div className="admin-stats">
        <div className="admin-card">
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Visualizações de página</div>
          <strong style={{ fontSize: "1.8rem" }}>{metrics.pageViews}</strong>
        </div>
        <div className="admin-card">
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Visitantes</div>
          <strong style={{ fontSize: "1.8rem" }}>—</strong>
        </div>
        <div className="admin-card">
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Newsletter</div>
          <strong style={{ fontSize: "1.8rem" }}>{leads.length}</strong>
        </div>
        <div className="admin-card">
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Artigos</div>
          <strong style={{ fontSize: "1.8rem" }}>{published.length}</strong>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            {drafts.length} rascunho(s)
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1rem" }}>
        <div className="admin-card">
          <h2 style={{ fontFamily: "var(--font-serif)", marginTop: 0 }}>Mais acessados</h2>
          <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
            {metrics.topArticles.map((a) => (
              <li key={a.slug} style={{ marginBottom: "0.45rem" }}>
                <Link href={`/artigos/${a.slug}`}>{a.title}</Link>
                <span style={{ color: "var(--text-muted)" }}> — {a.views} visualizações</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="admin-card">
          <h2 style={{ fontFamily: "var(--font-serif)", marginTop: 0 }}>Eventos</h2>
          <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
            {Object.entries(metrics.events)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 10)
              .map(([name, count]) => (
                <li key={name}>
                  {name}: <strong>{count}</strong>
                </li>
              ))}
            {!Object.keys(metrics.events).length && (
              <li style={{ color: "var(--text-muted)" }}>Ainda sem eventos registrados.</li>
            )}
          </ul>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            Visitantes únicos, scroll e tempo médio ainda não são medidos.
          </p>
        </div>
      </div>

      <div className="admin-card">
        <h2 style={{ fontFamily: "var(--font-serif)", marginTop: 0 }}>
          Artigos que precisam atualização
        </h2>
        {stale.length ? (
          <ul>
            {stale.map((a) => (
              <li key={a.slug}>
                <Link href={`/admin/artigos/${a.slug}`}>{a.title}</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "var(--text-muted)" }}>Nenhum artigo crítico no momento.</p>
        )}
      </div>
    </div>
  );
}
