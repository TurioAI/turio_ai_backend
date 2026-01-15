export interface I18nResponse {
  lang: string;
  version: number;
  updatedAt: string;
  strings: Record<string, string>;
}
