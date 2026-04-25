import type { ChangeEvent } from 'react';
import { useCallback, useState } from 'react';
import { toDateInput } from '~/shared/datetimes/datetimes.ts';
import type { SubmissionError } from '~/shared/types/errors.types.ts';
import { Input } from './input.tsx';

type Props = {
  start: { name: string; label: string; value: Date | null };
  end: { name: string; label: string; value: Date | null };
  min?: Date;
  max?: Date;
  required?: boolean;
  error?: SubmissionError;
  onChange?: (start: Date | null, end: Date | null) => void;
  className?: string;
};

export function DateRangeInput({ start, end, min, max, required, error, onChange, className }: Props) {
  const defaultStart = start.value ? toDateInput(start.value) : null;
  const defaultEnd = end.value ? toDateInput(end.value) : null;

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd || defaultStart);

  const handleStartDate = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newStartDate = event.target.value || null;

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
    [endDate, onChange],
  );

  const handleEndDate = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newEndDate = event.target.value || null;

      const newStartDate = !startDate ? newEndDate : startDate;
      setStartDate(newStartDate);
      setEndDate(newEndDate);

      if (onChange) onChange(newStartDate ? new Date(newStartDate) : null, newEndDate ? new Date(newEndDate) : null);
    },
    [startDate, onChange],
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
