import { I18nextProvider } from 'react-i18next';
import { i18nTest } from 'tests/i18n-helpers.ts';
import { page } from 'vitest/browser';
import { ScheduleTime } from '../../models/schedule-time.ts';
import type { ScheduleSession } from '../schedule.types.ts';
import Schedule from './schedule.tsx';

const sessionBlockRenders = new Map<string, number>();

vi.mock('../session/session-block.tsx', () => ({
  SessionBlock: ({ session }: { session: ScheduleSession }) => {
    sessionBlockRenders.set(session.id, (sessionBlockRenders.get(session.id) ?? 0) + 1);
    return <div>{session.name}</div>;
  },
}));

const scheduleTime = new ScheduleTime('UTC');
const day = new Date('2024-10-05T00:00:00.000Z');
const at = (hours: number) => new Date(`2024-10-05T${String(hours).padStart(2, '0')}:00:00.000Z`);

const session = (id: string, start: number, overrides: Partial<ScheduleSession> = {}): ScheduleSession => ({
  id,
  trackId: 'track-1',
  timeslot: { start: at(start), end: at(start + 1) },
  name: `Session ${id}`,
  language: null,
  color: 'stone',
  emojis: [],
  proposal: null,
  ...overrides,
});

const sessions = () => [session('a', 9), session('b', 10), session('c', 11)];

const noop = vi.fn();

const schedule = (data: Array<ScheduleSession>) => (
  <I18nextProvider i18n={i18nTest}>
    <Schedule
      displayedDays={[day]}
      displayedTimes={{ start: 9 * 60, end: 12 * 60 }}
      scheduleTime={scheduleTime}
      tracks={[
        { id: 'track-1', name: 'Track 1' },
        { id: 'track-2', name: 'Track 2' },
      ]}
      sessions={data}
      zoomLevel={1}
      onOpenSession={noop}
      onAddSession={noop}
      onMoveSession={noop}
      onResizeSession={noop}
      onSwapSessions={noop}
    />
  </I18nextProvider>
);

const renderSchedule = async (data: Array<ScheduleSession>) => {
  const screen = await page.render(schedule(data));
  sessionBlockRenders.clear();
  return screen;
};

describe('Schedule', () => {
  beforeEach(() => {
    sessionBlockRenders.clear();
  });

  it('renders every session once', async () => {
    const screen = await page.render(schedule(sessions()));

    await expect.element(screen.getByText('Session a')).toBeVisible();
    expect(sessionBlockRenders).toEqual(
      new Map([
        ['a', 1],
        ['b', 1],
        ['c', 1],
      ]),
    );
  });

  it('renders no session when the parent re-renders with the same sessions', async () => {
    const data = sessions();
    const screen = await renderSchedule(data);

    await screen.rerender(schedule(data));

    expect(sessionBlockRenders.size).toBe(0);
  });

  it('renders no session when the sessions are rebuilt with the same values', async () => {
    const screen = await renderSchedule(sessions());

    await screen.rerender(schedule(sessions()));

    expect(sessionBlockRenders.size).toBe(0);
  });

  it('renders only the session a mutation touches', async () => {
    const screen = await renderSchedule(sessions());

    await screen.rerender(schedule([session('a', 9), session('b', 10, { name: 'Renamed' }), session('c', 11)]));

    expect(sessionBlockRenders).toEqual(new Map([['b', 1]]));
  });

  it('renders only the session a move touches', async () => {
    const screen = await renderSchedule(sessions());

    await screen.rerender(schedule([session('a', 9), session('b', 10), session('c', 11, { trackId: 'track-2' })]));

    expect(sessionBlockRenders).toEqual(new Map([['c', 1]]));
  });
});
