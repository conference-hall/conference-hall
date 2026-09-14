import { useMemo } from 'react';
import { useFetcher, useNavigate, useParams, useSearchParams } from 'react-router';
import { useStableValue } from '~/shared/utils/use-stable-value.ts';
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

  // compute schedule days, keeping the same references between two renders without change: the loader is
  // revalidated on every Session mutation and hands new Date objects for the same period
  const scheduleDays = useStableValue(scheduleTime.days(start, end));

  const displayedDays = useMemo(
    () => scheduleDays.slice(displayedStart, (displayedEnd || displayedStart) + 1),
    [scheduleDays, displayedStart, displayedEnd],
  );

  // optimistic update
  const pendingTimesForm = fetcher.formData?.get('intent') === 'update-display-times' ? fetcher.formData : null;

  const displayedTimes = useMemo(() => {
    if (!pendingTimesForm) return { start: displayStartMinutes, end: displayEndMinutes };
    return {
      start: Number(pendingTimesForm.get('displayStartMinutes')),
      end: Number(pendingTimesForm.get('displayEndMinutes')),
    };
  }, [pendingTimesForm, displayStartMinutes, displayEndMinutes]);

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
