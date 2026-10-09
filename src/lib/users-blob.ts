import { blobEnabled, blobReadJson, blobWriteJson } from "./blob-json";

const KEY = "users";

export function hasBlobStore() {
  return blobEnabled();
}

export async function loadUsersFromBlob<T>(): Promise<T[] | null> {
  const data = await blobReadJson<T[]>(KEY);
  return Array.isArray(data) ? data : null;
}

export async function saveUsersToBlob(users: unknown[]): Promise<boolean> {
  if (!blobEnabled()) return false;
  try {
    await blobWriteJson(KEY, users);
    return true;
  } catch (err) {
    console.error("[users-store] save failed:", err);
    return false;
  }
}
