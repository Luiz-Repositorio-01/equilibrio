import { get, put } from "@vercel/blob";

const BLOB_PATHNAME = "cms/users.json";

export function hasBlobStore() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

export async function loadUsersFromBlob<T>(): Promise<T[] | null> {
  if (!hasBlobStore()) return null;
  try {
    const result = await get(BLOB_PATHNAME, {
      access: "private",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const text = await new Response(result.stream).text();
    const data = JSON.parse(text) as T[];
    return Array.isArray(data) ? data : null;
  } catch (err) {
    console.warn("[users-blob] load miss:", err instanceof Error ? err.message : err);
    return null;
  }
}

export async function saveUsersToBlob(users: unknown[]): Promise<boolean> {
  if (!hasBlobStore()) return false;
  try {
    await put(BLOB_PATHNAME, JSON.stringify(users, null, 2), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return true;
  } catch (err) {
    console.error("[users-blob] save failed:", err);
    return false;
  }
}
