export interface FileData {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}

export interface UploadResult {
  url: string;
  path: string;
  size: number;
}

export interface StorageService {
  uploadFile(file: FileData, directory?: string): Promise<UploadResult>;
  /**
   * Reads back an uploaded file from storage, given the reference stored in
   * Resume.fileUrl (either a local filesystem path or a cloud object URL).
   */
  readFile(pathOrUrl: string): Promise<Buffer>;
  deleteFile(path: string): Promise<void>;
  getFileUrl(path: string): string;
}

/**
 * Error thrown by storage providers when storage is not configured for the
 * current environment. The upload route surfaces this message to the client
 * so the user sees a useful, safe error instead of a generic 500.
 */
export class StorageConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageConfigurationError";
  }
}
