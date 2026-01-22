import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';

type ResourcesJson = {
  schemaVersion: number;
  version: string;
  images?: Record<string, any>;
  [key: string]: any;
};

@Injectable()
export class ResourcesService {
  private cached: ResourcesJson | null = null;
  private cachedVersion: string | null = null;
  private cachedMtimeMs: number | null = null;

  private readonly resourcesPath = path.join(process.cwd(), 'src', 'config', 'resources.json');

  private async loadIfNeeded(): Promise<void> {
    try {
      const stat = await fs.stat(this.resourcesPath);
      const mtimeMs = stat.mtimeMs;

      if (this.cached && this.cachedMtimeMs === mtimeMs) return;

      const raw = await fs.readFile(this.resourcesPath, 'utf-8');
      const parsed = JSON.parse(raw) as ResourcesJson;

      if (!parsed || typeof parsed !== 'object') {
        throw new Error('resources.json is not a valid JSON object');
      }
      if (parsed.schemaVersion == null) {
        throw new Error('resources.json missing "schemaVersion"');
      }
      if (!parsed.version) {
        throw new Error('resources.json missing "version"');
      }

      this.cached = parsed;
      this.cachedVersion = String(parsed.version);
      this.cachedMtimeMs = mtimeMs;
    } catch (err: any) {
      if (!this.cached) {
        throw new InternalServerErrorException(
          `Resources config unavailable: ${err?.message ?? String(err)}`,
        );
      }
    }
  }

  async getResources(): Promise<ResourcesJson> {
    await this.loadIfNeeded();
    return this.cached!;
  }

  async getResourcesVersion(): Promise<string> {
    await this.loadIfNeeded();
    return this.cachedVersion!;
  }
}
