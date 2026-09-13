import { useFetcher, useNavigate, useParams, useSearchParams } from 'react-router';
import type { ScheduleTime } from '../models/schedule-time.ts';

type ScheduleSettings = {
  start: Date;
  end: Date;
  displayStartMinutes: number;
  displayEndMinutes: number;
};

export function useDisplaySettings(settings: ScheduleSettings, scheduleTime: ScheduleTime) {
  const navigate = useNavigate();
  const fetcher = useFetcher({ key: 'update-display-times' });
  const params = useParams();
  const [searchParams] = useSearchParams();
  const [displayedStart, displayedEnd] = params.day?.split('-').map(Number) ?? [];

  const { start, end, displayStartMinutes, displayEndMinutes } = settings;

  // compute schedule days
  const scheduleDays = scheduleTime.days(start, end);
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

  const updateDisplayDays = async (startIndex: number, endIndex: number) => {
    await navigate(`/team/${params.team}/${params.event}/schedule/${startIndex}-${endIndex}?${searchParams}`);
  };

  return { scheduleDays, displayedDays, displayedTimes, updateDisplayTimes, updateDisplayDays };
}
