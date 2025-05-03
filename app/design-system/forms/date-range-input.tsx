import type { ChangeEvent } from 'react';
import { useCallback, useState } from 'react';
import { toDateInput } from '~/libs/datetimes/datetimes.ts';
import { utcToTimezone } from '~/libs/datetimes/timezone.ts';
import type { SubmissionError } from '~/types/errors.types.ts';
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
  const [startDate, setStartDate] = useState<Date | null>(start.value ? utcToTimezone(start.value, timezone) : null);
  const [endDate, setEndDate] = useState<Date | null>(end.value ? utcToTimezone(end.value, timezone) : null);

  console.log(startDate?.toString());

  const handleStartDate = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newStartDate = event.target.valueAsDate ? utcToTimezone(event.target.valueAsDate, timezone) : null;
      setStartDate(newStartDate);
      let newEndDate = endDate;
      if (!newStartDate) {
        newEndDate = null;
      } else if (!endDate) {
        newEndDate = newStartDate;
      } else if (newStartDate >= endDate) {
        newEndDate = newStartDate;
      }
      setEndDate(newEndDate);
      if (onChange) onChange(newStartDate, newEndDate);
    },
    [endDate, timezone, onChange],
  );

  const handleEndDate = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newEndDate = event.target.valueAsDate ? utcToTimezone(event.target.valueAsDate, timezone) : null;
      const newStartDate = !startDate ? newEndDate : startDate;
      setEndDate(newEndDate);
      setStartDate(newStartDate);
      if (onChange) onChange(newStartDate, newEndDate);
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
          value={toDateInput(startDate)}
          min={toDateInput(min)}
          max={toDateInput(max)}
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
          min={toDateInput(startDate) || toDateInput(min)}
          max={toDateInput(max)}
          value={toDateInput(endDate)}
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
