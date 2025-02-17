import { addDays, addMinutes } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { useFetcher, useParams } from 'react-router';

type ScheduleSettings = {
  start: Date;
  end: Date;
  timezone: string;
  displayStartMinutes: number;
  displayEndMinutes: number;
};

// TODO:
// - rename to useDisplaySettings
// - if one selected (day mode), if multiple (multi-day mode)
// returns startTime: number, endTime: number, schedule: string, nextDays, previousDays, mode
export function useDisplayTimes(settings: ScheduleSettings) {
  const params = useParams();
  const { start, end, timezone, displayStartMinutes, displayEndMinutes } = settings;

  // TODO: optimistic update
  const fetcher = useFetcher();
  // if (fetcher.formData?.get('intent') === 'update-display-times') {
  //   const start = Number(fetcher.formData?.get('displayStartMinutes'));
  //   const end = Number(fetcher.formData?.get('displayEndMinutes'));
  //   if (start <= end) {
  //     displayStartMinutes = start;
  //     displayEndMinutes = end;
  //   }
  // }

  // compute schedule days
  const displayedDays = params.day?.split(',').map(Number);
  const startTz = toZonedTime(start, timezone);
  const endTz = toZonedTime(end, timezone);
  const scheduleDays = getDatesInRange(startTz, endTz)
    .map((day) => {
      const startTime = addMinutes(day, displayStartMinutes);
      const endTime = addMinutes(day, displayEndMinutes);
      return { startTime, endTime };
    })
    .filter((_, index) => displayedDays?.includes(index));

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

  return { scheduleDays, update };
}

function getDatesInRange(startDate: Date, endDate: Date) {
  const dates = [];
  let currentDate = startDate;

  while (currentDate <= endDate) {
    dates.push(currentDate);
    currentDate = addDays(currentDate, 1);
  }

  return dates;
}
