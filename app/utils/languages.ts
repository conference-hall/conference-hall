import languages from './languages.json';

export const LANGUAGES = Object.entries(languages).map(([key, label]) => ({
  key,
  label,
}));

export function getLanguage(code: string | null) {
  return LANGUAGES.find(({ key }) => key === code)?.label;
}
