import { format } from 'date-fns';
import type { ChangeEvent } from 'react';
import { useCallback, useState } from 'react';

import type { InputProps } from './input.tsx';
import { Input } from './input.tsx';

type Props = {
  start: { value?: string | null } & InputProps;
  end: { value?: string | null } & InputProps;
  required?: boolean;
  error?: string | string[];
  className?: string;
};

export function DateRangeInput({ start, end, required, error, className }: Props) {
  const [startDate, setStartDate] = useState<Date | null>(start.value ? new Date(start.value) : null);
  const [endDate, setEndDate] = useState<Date | null>(end.value ? new Date(end.value) : null);

  const handleStartDate = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newStartDate = event.target.valueAsDate;
      setStartDate(newStartDate);
      if (!newStartDate) return setEndDate(null);
      if (!endDate) return setEndDate(newStartDate);
      if (newStartDate >= endDate) return setEndDate(newStartDate);
    },
    [endDate],
  );

  const handleEndDate = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newEndDate = event.target.valueAsDate;
      setEndDate(newEndDate);
      if (!startDate) return setStartDate(newEndDate);
    },
    [startDate],
  );

  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        <Input
          type="date"
          name={start.name}
          label={start.label}
          autoComplete="off"
          value={toDayFormat(startDate)}
          onChange={handleStartDate}
          className="col-span-2 sm:col-span-1"
          required={required}
          suppressHydrationWarning
        />
        <Input
          type="date"
          name={end.name}
          label={end.label}
          autoComplete="off"
          min={toDayFormat(startDate)}
          value={toDayFormat(endDate)}
          onChange={handleEndDate}
          className="col-span-2 sm:col-span-1"
          required={required}
          suppressHydrationWarning
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
