import Select from '~/design-system/forms/select.tsx';
import { getTimezonesList, getUserTimezone } from '~/libs/datetimes/timezone.ts';

import { ClientOnly } from '../utils/client-only.tsx';

type Props = { defaultValue?: string };

export function EventTimezoneInput({ defaultValue }: Props) {
  return <ClientOnly>{() => <TimezoneInput defaultValue={defaultValue} />}</ClientOnly>;
}

// TODO: manage hydration issue (disabled input, disable hydration issues?)
function TimezoneInput({ defaultValue }: Props) {
  const userTimezone = getUserTimezone();
  const timezonesOptions = getTimezonesList();

  return (
    <Select
      name="timezone"
      label="Event timezone"
      defaultValue={defaultValue || userTimezone}
      options={timezonesOptions}
    />
  );
}
