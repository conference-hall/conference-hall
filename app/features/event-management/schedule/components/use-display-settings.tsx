import { isSameDay } from 'date-fns';
import { useFetcher, useNavigate, useParams, useSearchParams } from 'react-router';
import { getDatesRange } from '~/shared/datetimes/datetimes.ts';
import { utcToTimezone } from '~/shared/datetimes/timezone.ts';

type ScheduleSettings = {
  start: Date;
  end: Date;
  timezone: string;
  displayStartMinutes: number;
  displayEndMinutes: number;
};

export function useDisplaySettings(settings: ScheduleSettings) {
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const [displayedStart, displayedEnd] = params.day?.split('-').map(Number) ?? [];

  const { start, end, timezone, displayStartMinutes, displayEndMinutes } = settings;

  // compute schedule days
  const startTz = utcToTimezone(start, timezone);
  const endTz = utcToTimezone(end, timezone);
  const scheduleDays = getDatesRange(startTz, endTz);
  const displayedDays = scheduleDays.slice(displayedStart, (displayedEnd || displayedStart) + 1);
  const displayedTimes = { start: displayStartMinutes, end: displayEndMinutes };

  // optimistic update
  if (fetcher.formData?.get('intent') === 'update-display-times') {
    displayedTimes.start = Number(fetcher.formData?.get('displayStartMinutes'));
    displayedTimes.end = Number(fetcher.formData?.get('displayEndMinutes'));
  }

  const updateDisplayTimes = (start: number, end: number) => {
    fetcher.submit(
      { intent: 'update-display-times', displayStartMinutes: start, displayEndMinutes: end },
      { method: 'POST', preventScrollReset: true },
    );
  };

  const updateDisplayDays = (start: Date, end: Date) => {
    const startIndex = scheduleDays.findIndex((day) => isSameDay(day, start));
    const endIndex = scheduleDays.findIndex((day) => isSameDay(day, end));
    navigate(`/team/${params.team}/${params.event}/schedule/${startIndex}-${endIndex}?${searchParams}`);
  };

  return { scheduleDays, displayedDays, displayedTimes, updateDisplayTimes, updateDisplayDays };
}
