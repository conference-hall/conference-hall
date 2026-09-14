import { DragDropProvider } from '@dnd-kit/react';
import { I18nextProvider } from 'react-i18next';
import { i18nTest } from 'tests/i18n-helpers.ts';
import { page } from 'vitest/browser';
import { ScheduleProviders } from '../../context/schedule-context.test-helpers.tsx';
import { makeDayGrid, slotHeight } from '../../models/day-grid.ts';
import { ScheduleTime } from '../../models/schedule-time.ts';
import type { ScheduleSession, Track } from '../schedule.types.ts';
import { Day } from './day-grid.tsx';

const scheduleTime = new ScheduleTime('Europe/Paris');

// 2024-10-05 at midnight, Schedule time.
const MIDNIGHT_UTC = Date.parse('2024-10-04T22:00:00.000Z');
const day = scheduleTime.fromUtc(new Date(MIDNIGHT_UTC));
const at = (hours: number, minutes = 0) =>
  scheduleTime.fromUtc(new Date(MIDNIGHT_UTC + (hours * 60 + minutes) * 60_000));

const tracks: Array<Track> = [
  { id: 'track-1', name: 'Room 1' },
  { id: 'track-2', name: 'Room 2' },
];

const session = (id: string, name: string, trackId: string, start: Date, end: Date): ScheduleSession => ({
  id,
  trackId,
  timeslot: { start, end },
  name,
  language: null,
  color: 'stone',
  emojis: [],
  proposal: null,
});

// 09:00 to 18:00 plus the hour row starting at 18:00: 120 slots, the first one on grid row 3.
const grid = makeDayGrid(day, 0, { start: 9 * 60, end: 18 * 60 }, tracks);

const inside = session('inside', 'Keynote', 'track-1', at(10), at(11));
const truncated = session('truncated', 'Closing', 'track-2', at(18, 30), at(19, 30));
const before = session('before', 'Breakfast', 'track-1', at(8), at(9, 30));

function renderDay(sessions: Array<ScheduleSession>) {
  return page.render(
    <I18nextProvider i18n={i18nTest}>
      <ScheduleProviders
        scheduleTime={scheduleTime}
        tracks={tracks}
        scheduleDays={[day]}
        displayedDays={[day]}
        sessions={sessions}
      >
        <DragDropProvider>
          <div style={{ '--slot-height': `${slotHeight(1)}px` } as React.CSSProperties}>
            <Day grid={grid} gutter multipleDays={false} />
          </div>
        </DragDropProvider>
      </ScheduleProviders>
    </I18nextProvider>,
  );
}

const placementOf = (id: string) => {
  const element = document.querySelector(`[data-session="${id}"]`);
  if (!element) return null;
  const style = getComputedStyle(element);
  return { column: style.gridColumnStart, row: style.gridRowStart, end: style.gridRowEnd };
};

describe('Day grid', () => {
  it('places a Session on the rows of its slots, in the column of its Track', async () => {
    await renderDay([inside, truncated, before]);

    // 10:00 is the 12th slot of a day starting at 09:00, and the first slot sits on row 3.
    expect(placementOf('inside')).toEqual({ column: '2', row: '15', end: 'span 12' });
  });

  it('truncates a Session ending past the displayed day', async () => {
    await renderDay([inside, truncated, before]);

    // 18:30 is the 114th slot; only 6 slots remain before the end of the displayed day.
    expect(placementOf('truncated')).toEqual({ column: '3', row: '117', end: 'span 6' });
  });

  it('draws no block for a Session starting before the displayed day', async () => {
    await renderDay([inside, truncated, before]);

    expect(placementOf('before')).toBeNull();
  });

  it('names each Track column and each Session block', async () => {
    await renderDay([inside, truncated, before]);

    const columns = Array.from(document.querySelectorAll('[data-column]'));
    expect(columns.map((column) => column.getAttribute('aria-label'))).toEqual(['Room 1', 'Room 2']);

    await expect.element(page.getByRole('button', { name: /Keynote/ })).toBeVisible();
    await expect.element(page.getByRole('button', { name: /Closing/ })).toBeVisible();
  });

  it('renders no element per slot', async () => {
    await renderDay([inside, truncated, before]);

    const dayElement = document.querySelector(`[data-day="${grid.dayKey}"]`);
    expect(dayElement?.querySelectorAll('*').length).toBeLessThan(100);
  });
});
