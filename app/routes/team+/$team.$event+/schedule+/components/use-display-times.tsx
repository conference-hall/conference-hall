import { addMinutes } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { useFetcher } from 'react-router';

export function useDisplayTimes(
  currentDay: Date,
  displayStartMinutes: number,
  displayEndMinutes: number,
  timezone: string,
) {
  const currentDayDate = toZonedTime(currentDay, timezone);
  const fetcher = useFetcher();

  // optimistic update
  if (fetcher.formData?.get('intent') === 'update-display-times') {
    const start = Number(fetcher.formData?.get('displayStartMinutes'));
    const end = Number(fetcher.formData?.get('displayEndMinutes'));
    if (start <= end) {
      displayStartMinutes = start;
      displayEndMinutes = end;
    }
  }

  const startTime = addMinutes(currentDayDate, displayStartMinutes);
  const endTime = addMinutes(currentDayDate, displayEndMinutes);

  const update = (start: number, end: number) => {
    fetcher.submit(
      {
        intent: 'update-display-times',
        displayStartMinutes: start,
        displayEndMinutes: end,
      },
      {
        method: 'POST',
        preventScrollReset: true,
      },
    );
  };

  return { currentDay: currentDayDate, startTime, endTime, update };
}
