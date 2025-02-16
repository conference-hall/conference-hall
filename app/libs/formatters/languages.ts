import languages from './languages.json';

export type LanguageValues = Array<{ value: string; label: string }>;

export const LANGUAGES: LanguageValues = Object.entries(languages).map(([id, data]) => ({
  value: id,
  label: data.language,
}));

export function getLanguage(code: string | null) {
  return LANGUAGES.find(({ value }) => value === code)?.label;
}

export function getFlag(code: string | null) {
  if (!code) return null;
  return languages[code as keyof typeof languages]?.flag;
}
