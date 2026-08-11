import { put, get, del } from "@vercel/blob";
import { StorageService, FileData, UploadResult, StorageConfigurationError } from "./StorageService";

const BLOB_STORAGE_HOST_SUFFIX = ".blob.vercel-storage.com";
const BLOB_PUBLIC_HOST_SUFFIX = ".public.blob.vercel-storage.com";

/**
 * Vercel Blob object storage provider — the production-safe storage for this
 * app (it is hosted on Vercel). Resumes are stored in a PRIVATE Blob store,
 * so every read happens server-side with the store credentials.
 *
 * Requires either:
 *  - `BLOB_READ_WRITE_TOKEN` (injected automatically by Vercel when a Blob
 *    store is connected to the project), or
 *  - Vercel OIDC (`BLOB_STORE_ID` + `VERCEL_OIDC_TOKEN`, auto-injected when
 *    the store is connected).
 */
function scrubError(err: unknown): { name: string; code?: string; message: string } {
  const anyErr = err as { name?: unknown; code?: unknown; message?: unknown } | null | undefined;
  const name = typeof anyErr?.name === "string" ? anyErr.name : "UnknownError";
  const code = typeof anyErr?.code === "string" ? anyErr.code : undefined;
  let message = typeof anyErr?.message === "string" ? anyErr.message : String(err ?? "unknown error");
  // Redact anything that looks like a credential or bearer token.
  message = message
    .replace(/(postgres(?:ql)?:\/\/)[^@\s]+@/gi, "$1***@")
    .replace(/(sk-or-v1-)[A-Za-z0-9]+/gi, "$1***")
    .replace(/(Bearer\s+)[A-Za-z0-9._-]+/gi, "$1***");
  return { name, code, message };
}

export class BlobStorageProvider implements StorageService {
  constructor() {
    console.log(
      "[STORAGE][BLOB] provider created: tokenPresent=" +
        Boolean(process.env.BLOB_READ_WRITE_TOKEN) +
        ", storeIdPresent=" +
        Boolean(process.env.BLOB_STORE_ID)
    );
  }

  private hasCredentials(): boolean {
    return Boolean(
      process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID
    );
  }

  isBlobRef(ref: string): boolean {
    if (typeof ref !== "string" || !ref) return false;
    try {
      const url = new URL(ref);
      const host = url.hostname;
      return (
        host === ".blob.vercel-storage.com" ||
        host.endsWith(BLOB_STORAGE_HOST_SUFFIX) ||
        host.endsWith(BLOB_PUBLIC_HOST_SUFFIX)
      );
    } catch {
      return false;
    }
  }

  async uploadFile(file: FileData, directory: string = "uploads"): Promise<UploadResult> {
    console.log(
      "[STORAGE][BLOB] uploadFile begin: hasCredentials=" +
        this.hasCredentials() +
        ", tokenPresent=" +
        Boolean(process.env.BLOB_READ_WRITE_TOKEN) +
        ", storeIdPresent=" +
        Boolean(process.env.BLOB_STORE_ID) +
        ", access=private, size=" +
        file.buffer.length
    );

    if (!this.hasCredentials()) {
      throw new StorageConfigurationError(
        "Resume storage is not configured. Create a Vercel Blob store and connect it to this project (Vercel injects BLOB_READ_WRITE_TOKEN automatically)."
      );
    }

    // `directory` may contain a user id; `file.fileName` is already sanitized
    // by the API route. No user-controlled path separators are allowed in the
    // pathname here. addRandomSuffix (default true) guarantees a unique blob.
    const pathname = `${directory}/${file.fileName}`;
    let blob;
    try {
      console.log("[STORAGE][BLOB] put() begin: contentType=" + (file.mimeType || "application/octet-stream"));
      blob = await put(pathname, file.buffer, {
        access: "private",
        contentType: file.mimeType || "application/octet-stream",
        addRandomSuffix: true,
      });
      console.log("[STORAGE][BLOB] put() done: host=" + new URL(blob.url).hostname);
    } catch (err) {
      console.error("[STORAGE][BLOB] put() THREW", scrubError(err));
      throw err;
    }

    return {
      url: blob.url,
      path: blob.url,
      size: file.buffer.length,
    };
  }

  async readFile(ref: string): Promise<Buffer> {
    if (!this.isBlobRef(ref)) {
      throw new Error(
        "The stored resume file is not available in cloud storage (it was uploaded before cloud storage was configured). Please upload a new resume."
      );
    }

    // Try private store first (the default for this app), then fall back to
    // public in case the store was created in public mode.
    let result = null;
    if (this.hasCredentials()) {
      result = await get(ref, { access: "private", useCache: false }).catch(() => null);
    }
    if (!result) {
      result = await get(ref, { access: "public", useCache: false }).catch(() => null);
    }
    if (!result || !result.stream) {
      throw new Error("Could not read the uploaded resume from storage. Please try uploading again.");
    }

    const reader = result.stream.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    return Buffer.concat(chunks);
  }

  async deleteFile(ref: string): Promise<void> {
    // Legacy rows recorded a local filesystem path. There is no blob to
    // delete for those — skip instead of failing the delete request.
    if (!this.isBlobRef(ref)) return;

    if (!this.hasCredentials()) {
      console.warn("[STORAGE] Skipping blob delete: BLOB_READ_WRITE_TOKEN is not configured.");
      return;
    }

    try {
      await del(ref);
    } catch (error: any) {
      // Deleting a missing blob is not an error worth surfacing.
      if (error && /not found|404/i.test(String(error?.message ?? error))) {
        return;
      }
      throw error;
    }
  }

  getFileUrl(filePath: string): string {
    return filePath;
  }
}

export const storage = new BlobStorageProvider();