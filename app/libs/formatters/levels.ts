export const LEVELS = [
  { key: 'BEGINNER', label: 'Beginner' },
  { key: 'INTERMEDIATE', label: 'Intermediate' },
  { key: 'ADVANCED', label: 'Advanced' },
];

// todo(i18n)
export function getLevel(code: string | null) {
  return LEVELS.find(({ key }) => key === code)?.label;
}
