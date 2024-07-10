import Select from '~/design-system/forms/select.tsx';
import { getTimezonesList, getUserTimezone } from '~/libs/datetimes/timezone.ts';

type Props = { name: string; label: string; defaultValue?: string; onChange?: (timezone: string) => void };

export function InputTimezone({ name, label, defaultValue, onChange }: Props) {
  const userTimezone = getUserTimezone();
  const timezonesOptions = getTimezonesList();

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
