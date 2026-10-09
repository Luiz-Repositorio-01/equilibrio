import { get, list, put } from "@vercel/blob";

/**
 * Persistência do CMS no Vercel Blob.
 *
 * Em produção (Vercel) o filesystem é somente leitura, então tudo que o admin
 * grava (artigos, anúncios, monetização) precisa ir para o Blob.
 * Localmente o Blob fica desligado (grava em disco, como sempre) — a menos que
 * CMS_BLOB=1 seja definido.
 */
export function blobEnabled() {
  if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) return false;
  return Boolean(process.env.VERCEL) || process.env.CMS_BLOB === "1";
}

const token = () => process.env.BLOB_READ_WRITE_TOKEN;

export async function blobReadJson<T>(pathname: string): Promise<T | null> {
  if (!blobEnabled()) return null;
  try {
    const result = await get(pathname, { access: "private", token: token() });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const text = await new Response(result.stream).text();
    return JSON.parse(text) as T;
  } catch (err) {
    console.warn(`[blob] leitura falhou (${pathname}):`, err instanceof Error ? err.message : err);
    return null;
  }
}

/** Lança erro se a gravação falhar — o admin precisa ver a falha, não um "salvo" falso. */
export async function blobWriteJson(pathname: string, data: unknown): Promise<void> {
  await put(pathname, JSON.stringify(data, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    token: token(),
  });
}

export async function blobListJson<T>(prefix: string): Promise<T[]> {
  if (!blobEnabled()) return [];
  const out: T[] = [];
  try {
    let cursor: string | undefined;
    do {
      const page = await list({ prefix, cursor, limit: 1000, token: token() });
      const items = await Promise.all(
        page.blobs.map((b) => blobReadJson<T>(b.pathname))
      );
      for (const item of items) if (item) out.push(item);
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
  } catch (err) {
    console.warn(`[blob] list falhou (${prefix}):`, err instanceof Error ? err.message : err);
  }
  return out;
}
