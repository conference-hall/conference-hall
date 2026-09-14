import { useCallback, useMemo } from 'react';
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

  const { submit } = fetcher;
  const updateDisplayTimes = useCallback(
    (start: number, end: number) => {
      submit(
        { intent: 'update-display-times', displayStartMinutes: start, displayEndMinutes: end },
        { method: 'POST', preventScrollReset: true },
      );
    },
    [submit],
  );

  const { team, event } = params;
  const updateDisplayDays = useCallback(
    async (startIndex: number, endIndex: number) => {
      await navigate(`/team/${team}/${event}/schedule/${startIndex}-${endIndex}?${searchParams}`);
    },
    [navigate, team, event, searchParams],
  );

  return { scheduleDays, displayedDays, displayedTimes, updateDisplayTimes, updateDisplayDays };
}
