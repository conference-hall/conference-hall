import { endOfHour, setHours, startOfHour } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { useState } from 'react';

export function useDisplayTimes(currentDay: string, timezone: string, startHour: number, endHour: number) {
  const currentDayDate = toZonedTime(currentDay, timezone);

  const [start, setStart] = useState<number>(startHour);
  const [end, setEnd] = useState<number>(endHour);

  const startTime = startOfHour(setHours(currentDayDate, start));
  const endTime = endOfHour(setHours(currentDayDate, end));

  const onChange = (startHour: number, endHour: number) => {
    setStart(startHour);
    setEnd(endHour);
  };

  return { currentDay: currentDayDate, startTime, endTime, onChange };
}
