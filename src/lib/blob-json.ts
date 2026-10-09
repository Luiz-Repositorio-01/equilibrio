/**
 * Persistência do CMS no Supabase (tabela `blog_cms_docs`, com RLS fechado:
 * só o servidor, usando a chave de serviço, lê e grava).
 *
 * Em produção (Vercel) o filesystem é somente leitura, então tudo que o admin
 * grava (artigos, anúncios, monetização, usuários) precisa ir para cá.
 * Localmente fica desligado (grava em disco, como sempre) — a menos que
 * CMS_BLOB=1 seja definido.
 *
 * (Nome do arquivo/funções "blob" mantido por histórico: antes era Vercel Blob.)
 */
const TABLE = "blog_cms_docs";

const url = () => (process.env.SUPABASE_URL || "").replace(/\/$/, "");
const serviceKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export function blobEnabled() {
  if (!url() || !serviceKey()) return false;
  return Boolean(process.env.VERCEL) || process.env.CMS_BLOB === "1";
}

function headers(extra?: Record<string, string>) {
  return {
    "Content-Type": "application/json",
    apikey: serviceKey(),
    Authorization: `Bearer ${serviceKey()}`,
    ...extra,
  };
}

async function request(path: string, init: RequestInit) {
  // Sem opção de cache: no Next 15 o padrão é não guardar, e `no-store` explícito
  // faria páginas ISR virarem dinâmicas (erro "static to dynamic") e a leitura falhar.
  const res = await fetch(`${url()}/rest/v1/${TABLE}${path}`, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Supabase falhou (${res.status}): ${text.slice(0, 200)}`);
  }
  return res;
}

/** Chama uma função SQL (RPC) com a chave de serviço. Lança erro se falhar. */
export async function storeRpc<T>(fn: string, args: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(`${url()}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Supabase rpc ${fn} falhou (${res.status}): ${text.slice(0, 200)}`);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

export async function blobReadJson<T>(key: string): Promise<T | null> {
  if (!blobEnabled()) return null;
  try {
    const res = await request(`?key=eq.${encodeURIComponent(key)}&select=data&limit=1`, {
      headers: headers(),
    });
    const rows = (await res.json()) as { data: T }[];
    return rows[0]?.data ?? null;
  } catch (err) {
    console.warn(`[store] leitura falhou (${key}):`, err instanceof Error ? err.message : err);
    return null;
  }
}

/** Lança erro se a gravação falhar — o admin precisa ver a falha, não um "salvo" falso. */
export async function blobWriteJson(key: string, data: unknown): Promise<void> {
  await request("?on_conflict=key", {
    method: "POST",
    headers: headers({ Prefer: "resolution=merge-duplicates,return=minimal" }),
    body: JSON.stringify({ key, data, updated_at: new Date().toISOString() }),
  });
}

export async function blobListJson<T>(prefix: string): Promise<T[]> {
  if (!blobEnabled()) return [];
  try {
    const res = await request(
      `?key=like.${encodeURIComponent(prefix)}*&select=data&order=key.asc&limit=1000`,
      { headers: headers() }
    );
    return ((await res.json()) as { data: T }[]).map((r) => r.data);
  } catch (err) {
    console.warn(`[store] list falhou (${prefix}):`, err instanceof Error ? err.message : err);
    return [];
  }
}
