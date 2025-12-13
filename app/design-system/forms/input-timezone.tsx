import { useTranslation } from 'react-i18next';
import Select from '~/design-system/forms/select.tsx';
import { getTimezonesList, getUserTimezone } from '~/shared/datetimes/timezone.ts';

type Props = { name: string; label: string; defaultValue?: string; onChange?: (timezone: string) => void };

export function InputTimezone({ name, label, defaultValue, onChange }: Props) {
  const { i18n } = useTranslation();
  const userTimezone = getUserTimezone();
  const timezonesOptions = getTimezonesList(i18n.language);

  const handleChange = (_name: string, value: string) => {
    if (!onChange) return;
    onChange(value);
  };

  return (
    <Select
      name={name}
      label={label}
      onChange={handleChange}
      defaultValue={defaultValue || userTimezone}
      options={timezonesOptions}
    />
  );
}
