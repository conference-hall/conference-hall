import endOfDay from 'date-fns/endOfDay/index.js';
import format from 'date-fns/format/index.js';
import formatISO from 'date-fns/formatISO/index.js';
import startOfDay from 'date-fns/startOfDay/index.js';
import type { ChangeEvent } from 'react';
import { useCallback, useState } from 'react';

import type { InputProps } from './Input.tsx';
import { Input } from './Input.tsx';

type Props = {
  start: { value?: string | null } & InputProps;
  end: { value?: string | null } & InputProps;
  error?: string | string[];
  className?: string;
};

export function DateRangeInput({ start, end, error, className }: Props) {
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
          name={`${start.name}-local`}
          label={start.label}
          autoComplete="off"
          value={toInputFormat(startDate)}
          onChange={handleStartDate}
          className="col-span-2 sm:col-span-1"
        />
        <input type="hidden" name={start.name} value={toISOFormat(startDate)} />
        <Input
          type="date"
          name={`${end.name}-local`}
          label={end.label}
          autoComplete="off"
          min={toInputFormat(startDate)}
          value={toInputFormat(endDate)}
          onChange={handleEndDate}
          className="col-span-2 sm:col-span-1"
        />
        <input type="hidden" name={end.name} value={toISOFormat(endDate, true)} />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function toInputFormat(date: Date | null) {
  if (!date) return '';
  return format(date, 'yyyy-MM-dd');
}

function toISOFormat(date: Date | null, end: boolean = false) {
  if (!date) return '';
  return formatISO(end ? endOfDay(date) : startOfDay(date));
}
