import { format, parse } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import type { ChangeEvent } from 'react';
import { useCallback, useState } from 'react';

import SelectNative from './select-native.tsx';

type Props = {
  start: { name: string; value?: string | null; label: string };
  end: { name: string; value?: string | null; label: string };
  timezone: string;
  required?: boolean;
  error?: string | string[];
  className?: string;
};

export function TimeRangeInput({ start, end, timezone, required, error, className }: Props) {
  const [startDate, setStartDate] = useState<Date | null>(
    start.value ? toZonedTime(parse(start.value, 'HH:mm', new Date()), timezone) : null,
  );
  const [endDate, setEndDate] = useState<Date | null>(
    end.value ? toZonedTime(parse(end.value, 'HH:mm', new Date()), timezone) : null,
  );

  const handleStartDate = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const newStartDate = event.target.value ? toZonedTime(event.target.value, timezone) : null;
      setStartDate(newStartDate);
      if (!newStartDate) return setEndDate(null);
      if (!endDate) return setEndDate(newStartDate);
      if (newStartDate >= endDate) return setEndDate(newStartDate);
    },
    [endDate, timezone],
  );

  const handleEndDate = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const newEndDate = event.target.value ? toZonedTime(event.target.value, timezone) : null;

      setEndDate(newEndDate);
      if (!startDate) return setStartDate(newEndDate);
    },
    [startDate, timezone],
  );

  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        <SelectNative
          name={start.name}
          label={start.label}
          value={toDayFormat(startDate)}
          onChange={handleStartDate}
          className="col-span-2 sm:col-span-1"
          required={required}
          suppressHydrationWarning
          options={[
            { name: '00:00', value: '0' },
            { name: '01:00', value: '1' },
          ]}
        />
        <SelectNative
          name={end.name}
          label={end.label}
          value={toDayFormat(endDate)}
          onChange={handleEndDate}
          className="col-span-2 sm:col-span-1"
          required={required}
          suppressHydrationWarning
          options={[
            { name: '00:00', value: '0' },
            { name: '01:00', value: '1' },
          ]}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function toDayFormat(date: Date | null) {
  if (!date) return '';
  return format(date, 'yyyy-MM-dd');
}
