"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import type { RevenueSource } from "@/lib/types";

type Dashboard = {
  estimatedRevenue: number;
  clicks: number;
  impressions: number;
  ctr: number;
  rpm: number;
  ecpm: number;
  visitors: number;
  sessions: number;
  pageViews: number;
  byMonth: { period: string; amount: number }[];
  byDay: { period: string; amount: number }[];
  byYear: { period: string; amount: number }[];
  byCategory: { category: string; amount: number }[];
  bySource: { source: string; amount: number }[];
  byOrigin: { origin: string; amount: number }[];
  topRevenueArticles: { slug: string; title: string; revenue: number; conversions: number }[];
  topConverting: { slug: string; title: string; revenue: number; conversions: number }[];
  entries: {
    id: string;
    date: string;
    source: string;
    amount: number;
    currency: string;
    manual: boolean;
    notes?: string;
  }[];
};

const SOURCES: { value: RevenueSource; label: string }[] = [
  { value: "adsense", label: "Google AdSense" },
  { value: "admanager", label: "Google Ad Manager" },
  { value: "affiliate", label: "Afiliados" },
  { value: "ezoic", label: "Ezoic" },
  { value: "mediavine", label: "Mediavine" },
  { value: "raptive", label: "Raptive" },
  { value: "monetag", label: "Monetag" },
  { value: "propellerads", label: "PropellerAds" },
  { value: "taboola", label: "Taboola" },
  { value: "outbrain", label: "Outbrain" },
  { value: "sponsor", label: "Patrocínio / Banner" },
  { value: "other", label: "Outros" },
];

function sourceLabel(source: string) {
  return SOURCES.find((s) => s.value === source)?.label || source;
}

function brl(n: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

export default function ReceitaAdminPage() {
  const [dash, setDash] = useState<Dashboard | null>(null);
  const [msg, setMsg] = useState("");
  const [importJson, setImportJson] = useState("");
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    source: "adsense" as RevenueSource,
    amount: "",
    currency: "BRL",
    impressions: "",
    clicks: "",
    conversions: "",
    articleSlug: "",
    categorySlug: "",
    origin: "",
    notes: "",
  });

  async function load() {
    const res = await fetch("/api/monetization?view=revenue");
    setDash(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function addEntry(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/monetization", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add_revenue",
        data: {
          ...form,
          amount: Number(form.amount || 0),
          impressions: Number(form.impressions || 0),
          clicks: Number(form.clicks || 0),
          conversions: Number(form.conversions || 0),
        },
      }),
    });
    const data = await res.json();
    if (data.dashboard) setDash(data.dashboard);
    setMsg("Lançamento manual registrado.");
    setForm((f) => ({ ...f, amount: "", impressions: "", clicks: "", conversions: "", notes: "" }));
  }

  async function removeEntry(id: string) {
    const res = await fetch("/api/monetization", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_revenue", id }),
    });
    const data = await res.json();
    if (data.dashboard) setDash(data.dashboard);
  }

  async function tryApiImport() {
    const res = await fetch("/api/monetization", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "try_api_import" }),
    });
    const data = await res.json();
    setMsg(data.message || "Verificação de API concluída.");
    if (data.dashboard) setDash(data.dashboard);
  }

  async function importEntries(e: FormEvent) {
    e.preventDefault();
    try {
      const parsed = JSON.parse(importJson);
      const rows = Array.isArray(parsed) ? parsed : parsed.entries || parsed.data || [];
      const res = await fetch("/api/monetization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "import_revenue", data: rows, fromApi: true }),
      });
      const data = await res.json();
      if (data.dashboard) setDash(data.dashboard);
      setMsg(`${data.imported || 0} lançamento(s) importado(s).`);
      setImportJson("");
    } catch {
      setMsg("JSON inválido. Use um array de objetos com date, source e amount.");
    }
  }

  if (!dash) {
    return <div className="admin-card">Carregando painel de receita...</div>;
  }

  return (
    <div style={{ display: "grid", gap: "1.2rem" }}>
      <div>
        <Link href="/admin/monetizacao" style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          ← Monetização
        </Link>
        <h1 style={{ fontFamily: "var(--font-serif)", margin: "0.4rem 0" }}>Painel de receita</h1>
        <p style={{ color: "var(--text-muted)", maxWidth: "48rem" }}>
          Acompanhe receita estimada, CTR, RPM e eCPM. Se a plataforma tiver API oficial configurada,
          os dados podem ser importados; caso contrário, use lançamentos manuais abaixo para um
          único painel consolidado.
        </p>
      </div>

      <div className="admin-stats">
        <div className="admin-card">
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Receita estimada</div>
          <strong style={{ fontSize: "1.5rem" }}>{brl(dash.estimatedRevenue)}</strong>
        </div>
        <div className="admin-card">
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Cliques</div>
          <strong style={{ fontSize: "1.5rem" }}>{dash.clicks}</strong>
        </div>
        <div className="admin-card">
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Impressões</div>
          <strong style={{ fontSize: "1.5rem" }}>{dash.impressions}</strong>
        </div>
        <div className="admin-card">
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>CTR</div>
          <strong style={{ fontSize: "1.5rem" }}>{dash.ctr}%</strong>
        </div>
      </div>

      <div className="admin-stats">
        <div className="admin-card">
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>RPM</div>
          <strong style={{ fontSize: "1.4rem" }}>{brl(dash.rpm)}</strong>
        </div>
        <div className="admin-card">
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>eCPM</div>
          <strong style={{ fontSize: "1.4rem" }}>{brl(dash.ecpm)}</strong>
        </div>
        <div className="admin-card">
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Visitantes</div>
          <strong style={{ fontSize: "1.4rem" }}>{dash.visitors}</strong>
        </div>
        <div className="admin-card">
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Sessões / Visualizações</div>
          <strong style={{ fontSize: "1.4rem" }}>
            {dash.sessions} / {dash.pageViews}
          </strong>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "1rem" }}>
        <div className="admin-card">
          <h2 style={{ fontFamily: "var(--font-serif)", marginTop: 0 }}>Artigos que mais geram receita</h2>
          <ul>
            {dash.topRevenueArticles.map((a) => (
              <li key={a.slug}>
                {a.title} — <strong>{brl(a.revenue)}</strong>
              </li>
            ))}
            {!dash.topRevenueArticles.length && (
              <li style={{ color: "var(--text-muted)" }}>Sem dados ainda.</li>
            )}
          </ul>
        </div>
        <div className="admin-card">
          <h2 style={{ fontFamily: "var(--font-serif)", marginTop: 0 }}>Artigos que mais convertem</h2>
          <ul>
            {dash.topConverting.map((a) => (
              <li key={a.slug}>
                {a.title} — <strong>{a.conversions}</strong> conversões
              </li>
            ))}
            {!dash.topConverting.length && (
              <li style={{ color: "var(--text-muted)" }}>Sem dados ainda.</li>
            )}
          </ul>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
        <div className="admin-card">
          <h3 style={{ fontFamily: "var(--font-serif)", marginTop: 0 }}>Por categoria</h3>
          <ul>
            {dash.byCategory.map((c) => (
              <li key={c.category}>
                {c.category}: {brl(c.amount)}
              </li>
            ))}
            {!dash.byCategory.length && <li style={{ color: "var(--text-muted)" }}>—</li>}
          </ul>
        </div>
        <div className="admin-card">
          <h3 style={{ fontFamily: "var(--font-serif)", marginTop: 0 }}>Origem do tráfego</h3>
          <ul>
            {dash.byOrigin.map((o) => (
              <li key={o.origin}>
                {o.origin}: {brl(o.amount)}
              </li>
            ))}
            {!dash.byOrigin.length && <li style={{ color: "var(--text-muted)" }}>—</li>}
          </ul>
        </div>
        <div className="admin-card">
          <h3 style={{ fontFamily: "var(--font-serif)", marginTop: 0 }}>Por fonte</h3>
          <ul>
            {dash.bySource.map((s) => (
              <li key={s.source}>
                {s.source}: {brl(s.amount)}
              </li>
            ))}
            {!dash.bySource.length && <li style={{ color: "var(--text-muted)" }}>—</li>}
          </ul>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
        <div className="admin-card">
          <h3 style={{ fontFamily: "var(--font-serif)", marginTop: 0 }}>Receita por dia</h3>
          <ul>
            {dash.byDay.map((d) => (
              <li key={d.period}>
                {d.period}: {brl(d.amount)}
              </li>
            ))}
            {!dash.byDay.length && <li style={{ color: "var(--text-muted)" }}>—</li>}
          </ul>
        </div>
        <div className="admin-card">
          <h3 style={{ fontFamily: "var(--font-serif)", marginTop: 0 }}>Receita por mês</h3>
          <ul>
            {dash.byMonth.map((d) => (
              <li key={d.period}>
                {d.period}: {brl(d.amount)}
              </li>
            ))}
            {!dash.byMonth.length && <li style={{ color: "var(--text-muted)" }}>—</li>}
          </ul>
        </div>
        <div className="admin-card">
          <h3 style={{ fontFamily: "var(--font-serif)", marginTop: 0 }}>Receita anual</h3>
          <ul>
            {dash.byYear.map((d) => (
              <li key={d.period}>
                {d.period}: {brl(d.amount)}
              </li>
            ))}
            {!dash.byYear.length && <li style={{ color: "var(--text-muted)" }}>—</li>}
          </ul>
        </div>
      </div>

      <div className="admin-card admin-form">
        <h2 style={{ fontFamily: "var(--font-serif)", marginTop: 0 }}>Importação (API / JSON)</h2>
        <p style={{ color: "var(--text-muted)", marginTop: 0 }}>
          Quando houver API oficial com chave cadastrada em Redes, tente a importação automática.
          Caso contrário, cole um JSON exportado da plataforma (array com{" "}
          <code>date</code>, <code>source</code>, <code>amount</code>).
        </p>
        <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap", marginBottom: "0.8rem" }}>
          <button type="button" className="btn btn--outline" onClick={tryApiImport}>
            Tentar importar via API
          </button>
        </div>
        <form onSubmit={importEntries}>
          <label>
            JSON para importar
            <textarea
              rows={5}
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder='[{"date":"2026-07-01","source":"adsense","amount":120.5,"currency":"BRL","impressions":10000,"clicks":80}]'
            />
          </label>
          <button className="btn btn--primary" type="submit">
            Importar JSON
          </button>
        </form>
      </div>

      <form className="admin-card admin-form" onSubmit={addEntry}>
        <h2 style={{ fontFamily: "var(--font-serif)", marginTop: 0 }}>Lançamento manual</h2>
        <p style={{ color: "var(--text-muted)", marginTop: 0 }}>
          Use quando a API da plataforma não estiver disponível ou configurada.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.7rem" }}>
          <label>
            Data
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </label>
          <label>
            Fonte
            <select
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value as RevenueSource })}
            >
              {SOURCES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Valor
            <input
              required
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </label>
          <label>
            Moeda
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
            >
              <option value="BRL">BRL</option>
              <option value="USD">USD</option>
            </select>
          </label>
          <label>
            Impressões
            <input
              type="number"
              value={form.impressions}
              onChange={(e) => setForm({ ...form, impressions: e.target.value })}
            />
          </label>
          <label>
            Cliques
            <input
              type="number"
              value={form.clicks}
              onChange={(e) => setForm({ ...form, clicks: e.target.value })}
            />
          </label>
          <label>
            Conversões
            <input
              type="number"
              value={form.conversions}
              onChange={(e) => setForm({ ...form, conversions: e.target.value })}
            />
          </label>
          <label>
            Slug do artigo
            <input
              value={form.articleSlug}
              onChange={(e) => setForm({ ...form, articleSlug: e.target.value })}
            />
          </label>
          <label>
            Categoria
            <input
              value={form.categorySlug}
              onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
              placeholder="saude-da-mente"
            />
          </label>
          <label>
            Origem do tráfego
            <input
              value={form.origin}
              onChange={(e) => setForm({ ...form, origin: e.target.value })}
              placeholder="organic, social, direct..."
            />
          </label>
        </div>
        <label>
          Observações
          <textarea
            rows={2}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </label>
        <button className="btn btn--primary" type="submit">
          Adicionar lançamento
        </button>
        {msg && <p>{msg}</p>}
      </form>

      <div className="admin-card">
        <h2 style={{ fontFamily: "var(--font-serif)", marginTop: 0 }}>Últimos lançamentos</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.92rem" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--text-muted)" }}>
              <th style={{ padding: "0.5rem" }}>Data</th>
              <th style={{ padding: "0.5rem" }}>Fonte</th>
              <th style={{ padding: "0.5rem" }}>Valor</th>
              <th style={{ padding: "0.5rem" }}>Tipo</th>
              <th style={{ padding: "0.5rem" }} />
            </tr>
          </thead>
          <tbody>
            {dash.entries.map((e) => (
              <tr key={e.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: "0.55rem" }}>{e.date}</td>
                <td style={{ padding: "0.55rem" }}>{sourceLabel(e.source)}</td>
                <td style={{ padding: "0.55rem" }}>
                  {e.currency} {e.amount}
                </td>
                <td style={{ padding: "0.55rem" }}>{e.manual ? "Manual" : "API"}</td>
                <td style={{ padding: "0.55rem" }}>
                  <button type="button" className="btn btn--outline" onClick={() => removeEntry(e.id)}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
            {!dash.entries.length && (
              <tr>
                <td colSpan={5} style={{ padding: "0.7rem", color: "var(--text-muted)" }}>
                  Nenhum lançamento ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
