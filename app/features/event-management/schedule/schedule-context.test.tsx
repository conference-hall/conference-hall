import { Component, type ReactNode } from 'react';
import { page } from 'vitest/browser';
import { ScheduleTime } from './models/schedule-time.ts';
import { type CurrentSchedule, ScheduleProvider, useCurrentSchedule } from './schedule-context.tsx';

const scheduleTime = new ScheduleTime('Europe/Paris');
const day = scheduleTime.fromUtc(new Date('2024-10-05T07:00:00.000Z'));

const currentSchedule: CurrentSchedule = {
  scheduleTime,
  tracks: [{ id: 'track-1', name: 'Room 1' }],
  scheduleDays: [day],
  displayedDays: [day],
  displayedTimes: { start: 9 * 60, end: 18 * 60 },
  addSession: async () => ({ status: 'placed', placement: { trackId: 'track-1', timeslot: { start: day, end: day } } }),
  updateSession: async () => ({
    status: 'placed',
    placement: { trackId: 'track-1', timeslot: { start: day, end: day } },
  }),
  deleteSession: async () => {},
};

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
      <ScheduleProvider value={currentSchedule}>
        <TestScheduleComponent />
      </ScheduleProvider>,
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

    await expect.element(page.getByText('useCurrentSchedule must be used within a ScheduleProvider')).toBeVisible();
  });
});
