import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';

type ThemeJson = {
  schemaVersion: number;
  version: string;
  colors?: Record<string, string>;
  textSizes?: Record<string, { size: number; weight: number }>;
  [key: string]: any;
};

@Injectable()
export class ThemeService {
  private cachedTheme: ThemeJson | null = null;
  private cachedVersion: string | null = null;
  private cachedMtimeMs: number | null = null;

  private readonly themePath = path.join(process.cwd(), 'src', 'config', 'theme.json');

  private async loadIfNeeded(): Promise<void> {
    try {
      const stat = await fs.stat(this.themePath);
      const mtimeMs = stat.mtimeMs;

      if (this.cachedTheme && this.cachedMtimeMs === mtimeMs) return;

      const raw = await fs.readFile(this.themePath, 'utf-8');
      const parsed = JSON.parse(raw) as ThemeJson;

      if (!parsed || typeof parsed !== 'object') {
        throw new Error('theme.json is not a valid JSON object');
      }
      if (parsed.schemaVersion == null) {
        throw new Error('theme.json missing "schemaVersion"');
      }
      if (!parsed.version) {
        throw new Error('theme.json missing "version"');
      }

      this.cachedTheme = parsed;
      this.cachedVersion = String(parsed.version);
      this.cachedMtimeMs = mtimeMs;
    } catch (err: any) {
      if (!this.cachedTheme) {
        throw new InternalServerErrorException(
          `Theme config unavailable: ${err?.message ?? String(err)}`,
        );
      }
    }
  }

  async getTheme(): Promise<ThemeJson> {
    await this.loadIfNeeded();
    return this.cachedTheme!;
  }

  async getThemeVersion(): Promise<string> {
    await this.loadIfNeeded();
    return this.cachedVersion!;
  }
}
