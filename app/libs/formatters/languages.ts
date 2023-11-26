import languages from './languages.json';

export type LanguageValues = Array<{ value: string; label: string }>;

export const LANGUAGES: LanguageValues = Object.entries(languages).map(([id, label]) => ({
  value: id,
  label,
}));

export function getLanguage(code: string | null) {
  return LANGUAGES.find(({ value }) => value === code)?.label;
}
