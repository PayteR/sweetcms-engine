import path from 'path';
import fs from 'fs/promises';

export interface StorageProvider {
  upload(filepath: string, buffer: Buffer): Promise<string>;
  delete(filepath: string): Promise<void>;
  url(filepath: string): string;
}

/** Filesystem storage — stores files in ./uploads/ */
class FilesystemStorage implements StorageProvider {
  private basePath: string;
  private baseUrl: string;

  constructor() {
    this.basePath = path.join(process.cwd(), 'uploads');
    this.baseUrl =
      process.env.NEXT_PUBLIC_CDN_URL ??
      process.env.NEXT_PUBLIC_APP_URL ??
      'http://localhost:3000';
  }

  async upload(filepath: string, buffer: Buffer): Promise<string> {
    const fullPath = path.join(this.basePath, filepath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, buffer);
    return filepath;
  }

  async delete(filepath: string): Promise<void> {
    const fullPath = path.join(this.basePath, filepath);
    await fs.unlink(fullPath).catch(() => {});
  }

  url(filepath: string): string {
    return `${this.baseUrl}/uploads/${filepath}`;
  }
}

let storage: StorageProvider | null = null;

/** Get the configured storage provider */
export function getStorage(): StorageProvider {
  if (!storage) {
    const backend = process.env.STORAGE_BACKEND ?? 'filesystem';
    if (backend === 's3') {
      // TODO: S3 storage implementation
      throw new Error('S3 storage not yet implemented');
    }
    storage = new FilesystemStorage();
  }
  return storage;
}
