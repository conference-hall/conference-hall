import { I18nextProvider } from 'react-i18next';
import { i18nTest } from 'tests/i18n-helpers.ts';
import { page, userEvent } from 'vitest/browser';
import { ScheduleTime } from '../../models/schedule-time.ts';
import { type CurrentSchedule, ScheduleProvider } from '../../schedule-context.tsx';
import type { ScheduleSession } from '../schedule.types.ts';
import { SessionBlock } from './session-block.tsx';

const scheduleTime = new ScheduleTime('Europe/Paris');
const day = scheduleTime.fromUtc(new Date('2024-10-05T07:00:00.000Z'));

const session: ScheduleSession = {
  id: 'session-1',
  trackId: 'track-1',
  timeslot: { start: day, end: scheduleTime.fromUtc(new Date('2024-10-05T08:00:00.000Z')) },
  name: 'Coffee break',
  language: null,
  color: 'stone',
  emojis: [],
  proposal: null,
};

const currentSchedule: CurrentSchedule = {
  scheduleTime,
  tracks: [{ id: 'track-1', name: 'Room 1' }],
  scheduleDays: [day],
  displayedDays: [day],
  displayedTimes: { start: 9 * 60, end: 18 * 60 },
  addSession: async () => ({ status: 'placed', placement: { trackId: 'track-1', timeslot: session.timeslot } }),
  updateSession: async () => ({ status: 'placed', placement: { trackId: 'track-1', timeslot: session.timeslot } }),
  deleteSession: async () => {},
};

function renderBlock() {
  const onOpen = vi.fn();
  const rendered = page.render(
    <I18nextProvider i18n={i18nTest}>
      <ScheduleProvider value={currentSchedule}>
        <SessionBlock session={session} height={80} onOpen={onOpen} />
      </ScheduleProvider>
    </I18nextProvider>,
  );
  return { rendered, onOpen };
}

describe('SessionBlock component', () => {
  it('asks to open the session with Enter', async () => {
    const { rendered, onOpen } = renderBlock();
    await rendered;

    await userEvent.tab();
    await expect.element(page.getByRole('button', { name: /Coffee break/ })).toHaveFocus();
    await userEvent.keyboard('{Enter}');

    expect(onOpen).toHaveBeenCalled();
  });

  it('asks to open the session with Space', async () => {
    const { rendered, onOpen } = renderBlock();
    await rendered;

    await userEvent.tab();
    await expect.element(page.getByRole('button', { name: /Coffee break/ })).toHaveFocus();
    await userEvent.keyboard(' ');

    expect(onOpen).toHaveBeenCalled();
  });

  it('asks to open the session on click', async () => {
    const { rendered, onOpen } = renderBlock();
    await rendered;

    await page.getByRole('button', { name: /Coffee break/ }).click();

    expect(onOpen).toHaveBeenCalled();
  });
});
