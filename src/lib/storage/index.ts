import { StorageService, StorageConfigurationError } from "./StorageService";
import { LocalStorageProvider } from "./LocalProvider";
import { BlobStorageProvider } from "./BlobStorageProvider";

let cached: StorageService | null = null;

/**
 * Selects the storage backend:
 *  - Vercel Blob (cloud object storage) when credentials exist, or anywhere
 *    running on Vercel (production).
 *  - Local filesystem ONLY for local development (Vercel's filesystem is
 *    read-only except ephemeral /tmp, so local disk can never be used there).
 */
export function getStorage(): StorageService {
  if (cached) return cached;

  const blobConfigured = Boolean(
    process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID
  );

  if (blobConfigured) {
    console.log("[STORAGE] provider selected: BlobStorageProvider (credentials present)");
    cached = new BlobStorageProvider();
  } else if (process.env.VERCEL === "1") {
    // Still return the provider so the missing-token error is handled inside
    // the request lifecycle (route catch block) as a readable message rather
    // than crashing the module at import time.
    console.error(
      "[STORAGE] Running on Vercel but BLOB_READ_WRITE_TOKEN is not set. " +
        "Create a Vercel Blob store and connect it to this project."
    );
    cached = new BlobStorageProvider();
  } else {
    console.log("[STORAGE] provider selected: LocalStorageProvider (local development)");
    cached = new LocalStorageProvider();
  }

  return cached;
}

export const storage = getStorage();

export type { StorageService } from "./StorageService";
export { StorageConfigurationError } from "./StorageService";
export { LocalStorageProvider } from "./LocalProvider";
export { BlobStorageProvider } from "./BlobStorageProvider";