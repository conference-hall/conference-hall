import { useFetchers, useSubmit } from 'react-router';
import { renderHook } from 'vitest-browser-react';
import { ScheduleTime } from '../models/schedule-time.ts';
import type { SessionData } from './schedule.types.ts';
import { useSessions } from './use-sessions.ts';

vi.mock('react-router', () => ({
  useFetchers: vi.fn(),
  useSubmit: vi.fn(),
}));

const scheduleTime = new ScheduleTime('Europe/Paris');

const utc = (hours: number) => new Date(`2024-10-05T${String(hours).padStart(2, '0')}:00:00.000Z`);
const local = (hours: number) => scheduleTime.fromUtc(utc(hours));

const sessionData = (overrides: Partial<SessionData> = {}): SessionData => ({
  id: 'session-1',
  trackId: 'track-1',
  start: utc(9),
  end: utc(10),
  name: 'Break',
  language: 'fr',
  color: 'blue',
  emojis: [],
  proposal: null,
  ...overrides,
});

describe('useSessions', () => {
  const submit = vi.fn();

  beforeEach(() => {
    vi.mocked(useSubmit).mockReturnValue(submit);
    vi.mocked(useFetchers).mockReturnValue([]);
  });

  it('keeps the same mutation callbacks when the sessions change', async () => {
    const { result, rerender } = await renderHook((data: Array<SessionData> = []) => useSessions(data, scheduleTime), {
      initialProps: [sessionData()],
    });
    const { add, update, move, resize, swap, delete: remove } = result.current;

    await rerender([sessionData(), sessionData({ id: 'session-2', start: utc(10), end: utc(11) })]);

    expect(result.current.add).toBe(add);
    expect(result.current.update).toBe(update);
    expect(result.current.move).toBe(move);
    expect(result.current.resize).toBe(resize);
    expect(result.current.swap).toBe(swap);
    expect(result.current.delete).toBe(remove);
  });

  it('keeps the same mutation callbacks when a mutation is in flight', async () => {
    const { result, rerender } = await renderHook(() => useSessions([sessionData()], scheduleTime));
    const { add } = result.current;

    const formData = new FormData();
    formData.set('intent', 'delete-session');
    formData.set('id', 'session-1');
    vi.mocked(useFetchers).mockReturnValue([{ formData }] as never);
    await rerender();

    expect(result.current.data).toEqual([]);
    expect(result.current.add).toBe(add);
  });

  it('places a mutation against the latest sessions', async () => {
    const { result, rerender } = await renderHook((data: Array<SessionData> = []) => useSessions(data, scheduleTime));
    const { add } = result.current;

    await rerender([sessionData()]);

    const outcome = await add({
      trackId: 'track-1',
      timeslot: { start: local(9), end: local(10) },
      language: null,
      color: 'blue',
      emojis: [],
    });

    expect(outcome.status).toBe('conflict');
    expect(submit).not.toHaveBeenCalled();
  });
});
