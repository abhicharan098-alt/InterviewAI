import { StorageService, FileData, UploadResult } from "./StorageService";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export class LocalStorageProvider implements StorageService {
  private baseDir: string;

  constructor() {
    // Store outside of public folder to prevent public exposure
    this.baseDir = path.join(process.cwd(), "storage");
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
    
    await fs.writeFile(filePath, file.buffer);

    return {
      url: `/api/files/${directory}/${safeName}`, // Secured behind our API
      path: filePath,
      size: file.buffer.length,
    };
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
