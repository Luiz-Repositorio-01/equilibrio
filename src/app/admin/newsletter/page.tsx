import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getNewsletterLeads } from "@/lib/cms";

export default async function AdminNewsletterPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");
  const leads = getNewsletterLeads();

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-serif)", margin: 0 }}>Newsletter / Contatos</h1>
        <p style={{ color: "var(--text-muted)" }}>{leads.length} inscritos</p>
      </div>
      <div className="admin-card">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--text-muted)" }}>
              <th style={{ padding: "0.6rem" }}>E-mail</th>
              <th style={{ padding: "0.6rem" }}>Origem</th>
              <th style={{ padding: "0.6rem" }}>Data</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: "0.7rem" }}>{l.email}</td>
                <td style={{ padding: "0.7rem" }}>{l.source}</td>
                <td style={{ padding: "0.7rem" }}>
                  {new Date(l.createdAt).toLocaleString("pt-BR")}
                </td>
              </tr>
            ))}
            {!leads.length && (
              <tr>
                <td colSpan={3} style={{ padding: "0.7rem", color: "var(--text-muted)" }}>
                  Nenhum lead ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
