import { blobEnabled, blobReadJson, blobWriteJson } from "./blob-json";

const KEY = "metrics";

export function hasBlobStore() {
  return blobEnabled();
}

export async function loadMetricsFromBlob<T>(): Promise<T | null> {
  return blobReadJson<T>(KEY);
}

export async function saveMetricsToBlob(data: unknown): Promise<boolean> {
  if (!blobEnabled()) return false;
  try {
    await blobWriteJson(KEY, data);
    return true;
  } catch (err) {
    console.error("[metrics-store] save failed:", err);
    return false;
  }
}
