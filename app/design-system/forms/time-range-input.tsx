import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectNative } from '~/design-system/forms/select-native.tsx';
import { toTimeFormat } from '~/libs/datetimes/datetimes.ts';

type Props = {
  nameStart?: string;
  nameEnd?: string;
  start: number;
  end: number;
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
  nameEnd = 'end',
  start,
  end,
  min = 0,
  max = MINUTES_IN_DAY,
  step = 60,
  startRelative,
  hideFromLabel,
  hideToLabel,
  onChange,
}: Props) {
  const { t } = useTranslation();
  const [startTime, setStart] = useState(start);
  const [endTime, setEnd] = useState(end);

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const minutes = Number(event.target.value);
    if (event.target.name === nameStart) {
      const minutesEnd = startRelative ? minutes + (endTime - startTime) : endTime;
      setStart(minutes);
      setEnd(minutesEnd);
      onChange(minutes, minutesEnd);
    }
    if (event.target.name === nameEnd) {
      setEnd(minutes);
      onChange(startTime, minutes);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <SelectNative
        name={nameStart}
        label={t('common.from')}
        value={startTime}
        options={generateTimeOptions(step, min, max).filter((o) => startRelative || Number(o.value) <= endTime)}
        onChange={handleSelectChange}
        srOnly={hideFromLabel}
        inline
      />

      <SelectNative
        name={nameEnd}
        label={t('common.to')}
        value={endTime}
        options={generateTimeOptions(step, min, max).filter((o) => Number(o.value) >= startTime)}
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
