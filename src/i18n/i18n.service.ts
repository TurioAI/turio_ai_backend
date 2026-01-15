import { Injectable, NotFoundException } from '@nestjs/common';
import { I18N_DATA, I18nLang } from './i18n.data';
import { I18nResponse } from './i18n.types';

@Injectable()
export class I18nService {
  getLangWithVersion(lang: string, clientVersion?: number): I18nResponse | null {
    const entry = (I18N_DATA as Record<string, any>)[lang];
    if (!entry) throw new NotFoundException('Language not supported');

    if (typeof clientVersion === 'number' && clientVersion === entry.version) {
      return null;
    }

    return {
      lang: lang as I18nLang,
      version: entry.version,
      updatedAt: entry.updatedAt.toISOString(),
      strings: entry.strings,
    };
  }
}
