import languages from './languages.json';

export type LanguageValues = Array<{ id: string; label: string }>;

export const LANGUAGES: LanguageValues = Object.entries(languages).map(([id, label]) => ({
  id,
  label,
}));

export function getLanguage(code: string | null) {
  return LANGUAGES.find(({ id }) => id === code)?.label;
}
