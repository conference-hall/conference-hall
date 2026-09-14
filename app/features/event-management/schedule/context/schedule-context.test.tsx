import { page } from 'vitest/browser';
import { SessionMutations } from '../models/session-mutation.ts';
import { buildCurrentSchedule } from './schedule-context.test-helpers.ts';
import {
  CurrentScheduleProvider,
  ScheduleSessionsProvider,
  useCurrentSchedule,
  useScheduleSessions,
} from './schedule-context.tsx';

describe('ScheduleContext', () => {
  function TestScheduleComponent() {
    const schedule = useCurrentSchedule();
    return (
      <>
        <p>Tracks: {schedule.tracks.map((track) => track.name).join(', ')}</p>
        <p>Days: {schedule.scheduleDays.length}</p>
        <p>
          Times: {schedule.displayedTimes.start}-{schedule.displayedTimes.end}
        </p>
      </>
    );
  }

  it('returns the provided schedule', async () => {
    const currentSchedule = buildCurrentSchedule();

    await page.render(
      <CurrentScheduleProvider value={currentSchedule}>
        <TestScheduleComponent />
      </CurrentScheduleProvider>,
    );

    await expect.element(page.getByText('Tracks: Room 1')).toBeVisible();
    await expect.element(page.getByText('Days: 1')).toBeVisible();
    await expect.element(page.getByText('Times: 540-1080')).toBeVisible();
  });
});

describe('ScheduleSessionsContext', () => {
  function TestSessionsComponent() {
    const sessions = useScheduleSessions();
    return <p>Sessions: {sessions.map((session) => session.name).join(', ')}</p>;
  }

  it('returns the provided sessions', async () => {
    const currentSchedule = buildCurrentSchedule();
    const day = currentSchedule.scheduleDays[0];

    const session = {
      ...SessionMutations.blank({ trackId: 'track-1', timeslot: { start: day, end: day } }),
      name: 'Break',
    };

    await page.render(
      <ScheduleSessionsProvider value={[session]}>
        <TestSessionsComponent />
      </ScheduleSessionsProvider>,
    );

    await expect.element(page.getByText('Sessions: Break')).toBeVisible();
  });
});
