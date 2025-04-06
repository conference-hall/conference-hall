import languages from './languages.json' with { type: 'json' };

type LanguageValues = Array<{ value: string; label: string }>;

export const LANGUAGES: LanguageValues = Object.entries(languages).map(([id, data]) => ({
  value: id,
  label: data.language,
}));

// todo(i18n)
export function getLanguage(code: string | null) {
  return LANGUAGES.find(({ value }) => value === code)?.label;
}

export function getFlag(code: string | null) {
  if (!code) return null;
  return languages[code as keyof typeof languages]?.flag;
}
