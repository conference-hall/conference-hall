import { format, setMinutes, startOfDay } from 'date-fns';
import type { ChangeEvent } from 'react';
import { useState } from 'react';

import SelectNative from '~/design-system/forms/select-native.tsx';

type Props = {
  startTime: number;
  endTime: number;
  step: number;
  min?: number;
  max?: number;
  startRelative?: boolean;
  onChange: (start: number, end: number) => void;
};

const MINUTES_IN_DAY = 23 * 60 + 59;

export function TimeRangeInput({
  startTime,
  endTime,
  min = 0,
  max = MINUTES_IN_DAY,
  step = 60,
  startRelative,
  onChange,
}: Props) {
  const [start, setStart] = useState(startTime);
  const [end, setEnd] = useState(endTime);

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const minutes = Number(event.target.value);
    if (event.target.name === 'start') {
      const minutesEnd = startRelative ? minutes + (end - start) : end;
      setStart(minutes);
      setEnd(minutesEnd);
      onChange(minutes, minutesEnd);
    }
    if (event.target.name === 'end') {
      setEnd(minutes);
      onChange(start, minutes);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <SelectNative
        name="start"
        label="From"
        value={start}
        options={generateTimeOptions(step, min, max).filter((o) => startRelative || Number(o.value) <= end)}
        onChange={handleSelectChange}
        inline
      />

      <SelectNative
        name="end"
        label="To"
        value={end}
        options={generateTimeOptions(step, min, max).filter((o) => Number(o.value) >= start)}
        onChange={handleSelectChange}
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
    name: formatTime(minutes),
    value: String(minutes),
  }));
}

function formatTime(minutes: number): string {
  const date = setMinutes(startOfDay(new Date()), minutes);
  return format(date, 'HH:mm');
}
