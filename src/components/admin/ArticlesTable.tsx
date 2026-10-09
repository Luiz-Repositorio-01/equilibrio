import Link from "next/link";
import type { ArticleSummary } from "@/lib/types";

const STATUS_PT: Record<string, string> = {
  published: "Publicado",
  draft: "Rascunho",
  scheduled: "Agendado",
};

function when(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "short",
  });
}

/** Lista de artigos do painel (usada em Artigos, Rascunhos e Agendamento). */
export function ArticlesTable({
  title,
  subtitle,
  articles,
  emptyTitle,
  emptyText,
  showScheduleColumn = false,
}: {
  title: string;
  subtitle: string;
  articles: ArticleSummary[];
  emptyTitle: string;
  emptyText: string;
  showScheduleColumn?: boolean;
}) {
  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", margin: 0 }}>{title}</h1>
          <p style={{ color: "var(--text-muted)" }}>{subtitle}</p>
        </div>
        <Link href="/admin/artigos/novo" className="btn btn--primary">
          Novo artigo
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="admin-card" style={{ textAlign: "center", padding: "2.2rem 1.2rem" }}>
          <h2 style={{ fontFamily: "var(--font-serif)", marginTop: 0 }}>{emptyTitle}</h2>
          <p style={{ color: "var(--text-muted)", margin: "0 auto 1.2rem", maxWidth: 520 }}>{emptyText}</p>
          <Link href="/admin/artigos" className="btn btn--outline">
            Ver todos os artigos
          </Link>
        </div>
      ) : (
        <div className="admin-card" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.92rem" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--text-muted)" }}>
                <th style={{ padding: "0.6rem" }}>Título</th>
                <th style={{ padding: "0.6rem" }}>Categoria</th>
                <th style={{ padding: "0.6rem" }}>Situação</th>
                {showScheduleColumn && <th style={{ padding: "0.6rem" }}>Vai ao ar em</th>}
                <th style={{ padding: "0.6rem" }}>Visualizações</th>
                <th style={{ padding: "0.6rem" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.slug} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "0.7rem" }}>{a.title}</td>
                  <td style={{ padding: "0.7rem" }}>{a.category}</td>
                  <td style={{ padding: "0.7rem" }}>
                    {STATUS_PT[a.status] || a.status}
                    {!showScheduleColumn && a.status === "scheduled" && a.scheduledFor
                      ? ` — ${when(a.scheduledFor)}`
                      : ""}
                  </td>
                  {showScheduleColumn && <td style={{ padding: "0.7rem" }}>{when(a.scheduledFor) || "—"}</td>}
                  <td style={{ padding: "0.7rem" }}>{a.views}</td>
                  <td style={{ padding: "0.7rem" }}>
                    <Link href={`/admin/artigos/${a.slug}`}>Editar</Link>
                    {a.status === "published" && (
                      <>
                        {" · "}
                        <Link href={`/artigos/${a.slug}`} target="_blank">
                          Ver
                        </Link>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
