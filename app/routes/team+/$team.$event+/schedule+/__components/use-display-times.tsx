import { useFetcher } from '@remix-run/react';
import { addHours, endOfHour, startOfHour } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export function useDisplayTimes(
  currentDay: string,
  displayStartHour: number,
  displayEndHour: number,
  timezone: string,
) {
  const currentDayDate = toZonedTime(currentDay, timezone);

  // @ts-expect-error
  const fetcher = useFetcher();

  // optimistic update
  if (fetcher.formData?.get('intent') === 'update-display-times') {
    const start = Number(fetcher.formData?.get('displayStartHour'));
    const end = Number(fetcher.formData?.get('displayEndHour'));
    if (start <= end) {
      displayStartHour = start;
      displayEndHour = end;
    }
  }

  const startTime = startOfHour(addHours(currentDayDate, displayStartHour));
  const endTime = endOfHour(addHours(currentDayDate, displayEndHour));

  const update = (start: number, end: number) => {
    fetcher.submit(
      {
        intent: 'update-display-times',
        displayStartHour: start,
        displayEndHour: end,
      },
      {
        method: 'POST',
        navigate: false,
        preventScrollReset: true,
      },
    );
  };

  return { currentDay: currentDayDate, startTime, endTime, update };
}
