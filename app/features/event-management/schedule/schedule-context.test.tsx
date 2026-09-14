import { Component, type ReactNode } from 'react';
import { page } from 'vitest/browser';
import { SessionMutations } from './models/session-mutation.ts';
import { buildCurrentSchedule } from './schedule-context.test-helpers.ts';
import {
  CurrentScheduleProvider,
  ScheduleSessionsProvider,
  useCurrentSchedule,
  useScheduleSessions,
} from './schedule-context.tsx';

const currentSchedule = buildCurrentSchedule();
const day = currentSchedule.scheduleDays[0];

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

function TestSessionsComponent() {
  const sessions = useScheduleSessions();
  return <p>Sessions: {sessions.map((session) => session.name).join(', ')}</p>;
}

class ErrorCatcher extends Component<{ children: ReactNode }, { message: string | null }> {
  state = { message: null };

  static getDerivedStateFromError(error: Error) {
    return { message: error.message };
  }

  render() {
    if (this.state.message) return <p>{this.state.message}</p>;
    return this.props.children;
  }
}

describe('ScheduleContext', () => {
  it('returns the provided schedule', async () => {
    await page.render(
      <CurrentScheduleProvider value={currentSchedule}>
        <TestScheduleComponent />
      </CurrentScheduleProvider>,
    );

    await expect.element(page.getByText('Tracks: Room 1')).toBeVisible();
    await expect.element(page.getByText('Days: 1')).toBeVisible();
    await expect.element(page.getByText('Times: 540-1080')).toBeVisible();
  });

  it('throws when used outside of the provider', async () => {
    await page.render(
      <ErrorCatcher>
        <TestScheduleComponent />
      </ErrorCatcher>,
    );

    await expect
      .element(page.getByText('useCurrentSchedule must be used within a CurrentScheduleProvider'))
      .toBeVisible();
  });
});

describe('ScheduleSessionsContext', () => {
  it('returns the provided sessions', async () => {
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

  it('throws when used outside of the provider', async () => {
    await page.render(
      <ErrorCatcher>
        <TestSessionsComponent />
      </ErrorCatcher>,
    );

    await expect
      .element(page.getByText('useScheduleSessions must be used within a ScheduleSessionsProvider'))
      .toBeVisible();
  });
});
