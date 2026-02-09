import { enStrings } from './translations/en';
import { esStrings } from './translations/es';

export const I18N_DATA = {
  en: {
    version: 2,
    updatedAt: new Date('2026-01-14T10:00:00.000Z'),
    strings: enStrings,
  },
  es: {
    version: 2,
    updatedAt: new Date('2026-01-14T10:00:00.000Z'),
    strings: esStrings,
  },
} as const;

export type I18nLang = keyof typeof I18N_DATA;
