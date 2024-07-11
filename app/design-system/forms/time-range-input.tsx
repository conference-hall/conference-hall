import { format, setMinutes, startOfDay } from 'date-fns';
import type { ChangeEvent } from 'react';
import { useState } from 'react';

import { SelectNative } from '~/design-system/forms/select-native.tsx';

type Props = {
  nameStart?: string;
  startTime: number;
  nameEnd?: string;
  endTime: number;
  step: number;
  min?: number;
  max?: number;
  startRelative?: boolean;
  hideFromLabel?: boolean;
  hideToLabel?: boolean;
  onChange: (start: number, end: number) => void;
};

const MINUTES_IN_DAY = 23 * 60 + 59;

export function TimeRangeInput({
  nameStart = 'start',
  startTime,
  nameEnd = 'end',
  endTime,
  min = 0,
  max = MINUTES_IN_DAY,
  step = 60,
  startRelative,
  hideFromLabel,
  hideToLabel,
  onChange,
}: Props) {
  const [start, setStart] = useState(startTime);
  const [end, setEnd] = useState(endTime);

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const minutes = Number(event.target.value);
    if (event.target.name === nameStart) {
      const minutesEnd = startRelative ? minutes + (end - start) : end;
      setStart(minutes);
      setEnd(minutesEnd);
      onChange(minutes, minutesEnd);
    }
    if (event.target.name === nameEnd) {
      setEnd(minutes);
      onChange(start, minutes);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <SelectNative
        name={nameStart}
        label="From"
        value={start}
        options={generateTimeOptions(step, min, max).filter((o) => startRelative || Number(o.value) <= end)}
        onChange={handleSelectChange}
        srOnly={hideFromLabel}
        inline
      />

      <SelectNative
        name={nameEnd}
        label="To"
        value={end}
        options={generateTimeOptions(step, min, max).filter((o) => Number(o.value) >= start)}
        onChange={handleSelectChange}
        srOnly={hideToLabel}
        inline
      />
    </div>
  );
}

function generateTimeOptions(step: number, min: number, max: number) {
  const minutesArray: Array<number> = [];
  for (let i = min; i <= max; i += step) {
    minutesArray.push(i);
  }
  return minutesArray.map((minutes) => ({
    name: toTimeFormat(minutes),
    value: String(minutes),
  }));
}

function toTimeFormat(minutes: number): string {
  const date = setMinutes(startOfDay(new Date()), minutes);
  return format(date, 'HH:mm');
}
