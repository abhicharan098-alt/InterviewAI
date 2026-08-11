import { StorageService, FileData, UploadResult } from "./StorageService";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

/**
 * Local filesystem storage provider. THIS IS ONLY SAFE FOR LOCAL
 * DEVELOPMENT. Vercel Functions run on a read-only filesystem (only the
 * ephemeral /tmp directory is writable), so this provider must never be
 * selected in production. The provider factory in ./index.ts handles that.
 */
export class LocalStorageProvider implements StorageService {
  private baseDir: string;

  constructor(baseDir?: string) {
    // Store outside of public folder to prevent public exposure
    this.baseDir = baseDir ?? path.join(process.cwd(), "storage");
  }

  private async ensureDirectory(dirPath: string) {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  async uploadFile(file: FileData, directory: string = "uploads"): Promise<UploadResult> {
    const targetDir = path.join(this.baseDir, directory);
    await this.ensureDirectory(targetDir);

    const ext = path.extname(file.fileName);
    const uniqueId = crypto.randomBytes(16).toString("hex");
    const safeName = `${uniqueId}${ext}`;
    
    const filePath = path.join(targetDir, safeName);

    // Double-check the resolved path stays inside baseDir (defense in depth
    // against path traversal in the directory/name inputs).
    const resolvedBase = path.resolve(this.baseDir);
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(resolvedBase + path.sep)) {
      throw new Error("Invalid storage path");
    }

    await fs.writeFile(filePath, file.buffer);

    return {
      url: `/api/files/${directory}/${safeName}`, // Secured behind our API
      path: filePath,
      size: file.buffer.length,
    };
  }

  async readFile(filePath: string): Promise<Buffer> {
    return fs.readFile(filePath);
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error: any) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }

  getFileUrl(filePath: string): string {
    return filePath;
  }
}

export const storage = new LocalStorageProvider();
