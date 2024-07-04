import Select from '~/design-system/forms/select.tsx';
import { getTimezonesList, getUserTimezone } from '~/libs/datetimes/timezone.ts';

import { ClientOnly } from '../../routes/__components/utils/client-only.tsx';

type Props = { name: string; label: string; defaultValue?: string; onChange?: (timezone: string) => void };

export function InputTimezone(props: Props) {
  return <ClientOnly>{() => <InputTimezoneWrapped {...props} />}</ClientOnly>;
}

// TODO: manage hydration issue (disabled input, disable hydration issues?)
function InputTimezoneWrapped({ name, label, defaultValue, onChange }: Props) {
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
