import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { listArticlesAdmin } from "@/lib/cms";

const STATUS_PT: Record<string, string> = {
  published: "Publicado",
  draft: "Rascunho",
  scheduled: "Agendado",
};

export default async function AdminArticlesPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");
  const articles = await listArticlesAdmin();

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", margin: 0 }}>Artigos</h1>
          <p style={{ color: "var(--text-muted)" }}>{articles.length} conteúdos no CMS</p>
        </div>
        <Link href="/admin/artigos/novo" className="btn btn--primary">
          Novo artigo
        </Link>
      </div>
      <div className="admin-card" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.92rem" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--text-muted)" }}>
              <th style={{ padding: "0.6rem" }}>Título</th>
              <th style={{ padding: "0.6rem" }}>Categoria</th>
              <th style={{ padding: "0.6rem" }}>Situação</th>
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
                  {a.status === "scheduled" && a.scheduledFor
                    ? ` — ${new Date(a.scheduledFor).toLocaleString("pt-BR", {
                        timeZone: "America/Sao_Paulo",
                        dateStyle: "short",
                        timeStyle: "short",
                      })}`
                    : ""}
                </td>
                <td style={{ padding: "0.7rem" }}>{a.views}</td>
                <td style={{ padding: "0.7rem" }}>
                  <Link href={`/admin/artigos/${a.slug}`}>Editar</Link>
                  {" · "}
                  <Link href={`/artigos/${a.slug}`} target="_blank">
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
