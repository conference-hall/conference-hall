import { useTranslation } from 'react-i18next';
import { getTimezonesList, getUserTimezone } from '~/libs/datetimes/timezone.ts';
import Select from '~/shared/design-system/forms/select.tsx';

type Props = { name: string; label: string; defaultValue?: string; onChange?: (timezone: string) => void };

export function InputTimezone({ name, label, defaultValue, onChange }: Props) {
  const { i18n } = useTranslation();
  const userTimezone = getUserTimezone();
  const timezonesOptions = getTimezonesList(i18n.language);

  return (
    <Select
      name={name}
      label={label}
      onChange={(_, value) => (onChange ? onChange(value) : null)}
      defaultValue={defaultValue || userTimezone}
      options={timezonesOptions}
    />
  );
}
