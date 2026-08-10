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
  deleteFile(path: string): Promise<void>;
  getFileUrl(path: string): string;
}
