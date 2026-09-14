import { page } from 'vitest/browser';
import { dayKeyOf } from '../models/day-grid.ts';
import { SessionMutations } from '../models/session-mutation.ts';
import { useGesture } from '../store/gesture-store.ts';
import { useColumnIds, useSession, useSettings } from '../store/schedule-store.ts';
import { buildScheduleSettings, ScheduleProviders } from './schedule-context.test-helpers.tsx';
import { useScheduleContext } from './schedule-context.tsx';

const { scheduleDays, displayedTimes } = buildScheduleSettings();
const day = scheduleDays[0];

const session = {
  ...SessionMutations.blank({ trackId: 'track-1', timeslot: { start: day, end: day } }),
  id: 'session-1',
  name: 'Break',
};

function ScheduleUnderTest() {
  const settings = useSettings();
  const { scheduleTime } = useScheduleContext();
  const stored = useSession('session-1');
  const ids = useColumnIds(dayKeyOf(day), 'track-1');
  const gesture = useGesture((current) => current?.kind ?? 'none');

  return (
    <>
      <p>Tracks: {settings.tracks.map((track) => track.name).join(', ')}</p>
      <p>Days: {settings.scheduleDays.length}</p>
      <p>
        Times: {settings.displayedTimes.start}-{settings.displayedTimes.end}
      </p>
      <p>Start: {scheduleTime.formatTime(day, 'en')}</p>
      <p>Session: {stored?.name ?? 'none'}</p>
      <p>Column: {ids.join(', ') || 'empty'}</p>
      <p>Gesture: {gesture}</p>
    </>
  );
}

describe('the providers of a Schedule', () => {
  it('serves the display settings, the Schedule time, the stored Sessions and the live gesture', async () => {
    await page.render(
      <ScheduleProviders sessions={[session]}>
        <ScheduleUnderTest />
      </ScheduleProviders>,
    );

    await expect.element(page.getByText('Tracks: Room 1')).toBeVisible();
    await expect.element(page.getByText('Days: 1')).toBeVisible();
    await expect.element(page.getByText(`Times: ${displayedTimes.start}-${displayedTimes.end}`)).toBeVisible();
    await expect.element(page.getByText('Start: 09:00')).toBeVisible();
    await expect.element(page.getByText('Session: Break')).toBeVisible();
    await expect.element(page.getByText('Column: session-1')).toBeVisible();
    await expect.element(page.getByText('Gesture: none')).toBeVisible();
  });

  it('serves an empty Schedule without a Session', async () => {
    await page.render(
      <ScheduleProviders>
        <ScheduleUnderTest />
      </ScheduleProviders>,
    );

    await expect.element(page.getByText('Session: none')).toBeVisible();
    await expect.element(page.getByText('Column: empty')).toBeVisible();
  });
});
