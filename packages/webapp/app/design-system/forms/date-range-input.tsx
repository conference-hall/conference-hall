import type { SubmissionError } from '@conference-hall/shared/types/errors.types.ts';
import type { ChangeEvent } from 'react';
import { useCallback, useState } from 'react';
import { toDateInput } from '~/shared/datetimes/datetimes.ts';
import { utcToTimezone } from '~/shared/datetimes/timezone.ts';
import { Input } from './input.tsx';

type Props = {
  start: { name: string; label: string; value: Date | null };
  end: { name: string; label: string; value: Date | null };
  timezone: string;
  min?: Date;
  max?: Date;
  required?: boolean;
  error?: SubmissionError;
  onChange?: (start: Date | null, end: Date | null) => void;
  className?: string;
};

export function DateRangeInput({ start, end, timezone, min, max, required, error, onChange, className }: Props) {
  const defaultStart = start.value ? toDateInput(utcToTimezone(start.value, timezone)) : null;
  const defaultEnd = end.value ? toDateInput(utcToTimezone(end.value, timezone)) : null;

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd || defaultStart);

  const handleStartDate = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newStartDate = event.target.valueAsDate
        ? toDateInput(utcToTimezone(event.target.valueAsDate, timezone))
        : null;

      let newEndDate = endDate;
      if (!newStartDate) {
        newEndDate = null;
      } else if (!endDate) {
        newEndDate = newStartDate;
      } else if (new Date(newStartDate) >= new Date(endDate)) {
        newEndDate = newStartDate;
      }
      setStartDate(newStartDate);
      setEndDate(newEndDate);

      if (onChange) onChange(newStartDate ? new Date(newStartDate) : null, newEndDate ? new Date(newEndDate) : null);
    },
    [endDate, timezone, onChange],
  );

  const handleEndDate = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newEndDate = event.target.valueAsDate
        ? toDateInput(utcToTimezone(event.target.valueAsDate, timezone))
        : null;

      const newStartDate = !startDate ? newEndDate : startDate;
      setStartDate(newStartDate);
      setEndDate(newEndDate);

      if (onChange) onChange(newStartDate ? new Date(newStartDate) : null, newEndDate ? new Date(newEndDate) : null);
    },
    [startDate, timezone, onChange],
  );

  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        <Input
          type="date"
          name={start.name}
          label={start.label}
          autoComplete="off"
          value={startDate || ''}
          min={toDateInput(min) || ''}
          max={toDateInput(max) || ''}
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
          min={startDate || toDateInput(min) || ''}
          max={toDateInput(max) || ''}
          value={endDate || ''}
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
