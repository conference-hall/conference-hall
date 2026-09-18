import type { SubmitFunction } from 'react-router';
import { renderHook } from 'vitest-browser-react';
import type { ScheduleSession } from '../components/schedule.types.ts';
import { ScheduleTime } from '../models/schedule-time.ts';
import { ScheduleStore } from '../store/schedule-store.ts';
import { buildScheduleSettings } from './schedule-context.test-helpers.tsx';
import { useSessionMutations } from './use-session-mutations.ts';

const submit = vi.fn<SubmitFunction>();

const scheduleTime = new ScheduleTime('Europe/Paris');
const settings = buildScheduleSettings();

const local = (hours: number) =>
  scheduleTime.fromUtc(new Date(`2024-10-05T${String(hours).padStart(2, '0')}:00:00.000Z`));

const session = (id: string, start: number, end: number): ScheduleSession => ({
  id,
  trackId: 'track-1',
  timeslot: { start: local(start), end: local(end) },
  name: 'Break',
  language: null,
  color: 'blue',
  emojis: [],
  proposal: null,
});

const morning = session('session-1', 9, 10);

function renderMutations(sessions: Array<ScheduleSession> = [morning]) {
  const store = new ScheduleStore({ sessions, settings });
  return renderHook(() => useSessionMutations(store, scheduleTime, submit));
}

const lastSubmit = () => {
  const [formData, options] = submit.mock.calls.at(-1) ?? [];
  return { formData: formData as FormData, options: options as Record<string, unknown> };
};

describe('useSessionMutations', () => {
  it('submits a move as an update keyed on the Session, flushed synchronously', async () => {
    const { result } = await renderMutations();

    const outcome = await result.current.move(morning, { trackId: 'track-1', start: local(11) });

    expect(outcome.status).toBe('placed');
    const { formData, options } = lastSubmit();
    expect(formData.get('intent')).toBe('update-session');
    expect(formData.get('id')).toBe('session-1');
    expect(options).toMatchObject({
      method: 'POST',
      navigate: false,
      fetcherKey: 'session:session-1',
      flushSync: true,
    });
  });

  it('submits a resize as an update on the same key', async () => {
    const { result } = await renderMutations();

    await result.current.resize(morning, local(12));

    const { formData, options } = lastSubmit();
    expect(formData.get('intent')).toBe('update-session');
    expect(options).toMatchObject({ fetcherKey: 'session:session-1', flushSync: true });
  });

  it('submits a swap on the key of the dragged Session', async () => {
    const other = session('session-2', 14, 15);
    const { result } = await renderMutations([morning, other]);

    await result.current.swap(morning, other);

    const { formData, options } = lastSubmit();
    expect(formData.get('intent')).toBe('switch-sessions');
    expect(formData.get('sourceId')).toBe('session-1');
    expect(formData.get('targetId')).toBe('session-2');
    expect(options).toMatchObject({ fetcherKey: 'session:session-1', flushSync: true });
  });

  it('submits an add on the key of the Session it creates', async () => {
    const { result } = await renderMutations();

    await result.current.add({ ...morning, timeslot: { start: local(14), end: local(15) } });

    const { formData, options } = lastSubmit();
    expect(formData.get('intent')).toBe('add-session');
    expect(options.fetcherKey).toBe(`session:${formData.get('id')}`);
    expect(options).toMatchObject({ flushSync: true });
  });

  it('submits a delete without a key and without flushing', async () => {
    const { result } = await renderMutations();

    await result.current.delete(morning);

    const { formData, options } = lastSubmit();
    expect(formData.get('intent')).toBe('delete-session');
    expect(options).toMatchObject({ fetcherKey: undefined, flushSync: false });
  });

  it('submits nothing when the Placement rule refuses the mutation', async () => {
    const { result } = await renderMutations([morning, session('session-2', 14, 15)]);

    const outcome = await result.current.move(morning, { trackId: 'track-1', start: local(14) });

    expect(outcome.status).toBe('conflict');
    expect(submit).not.toHaveBeenCalled();
  });

  it('places a mutation against the Sessions the store holds now', async () => {
    const store = new ScheduleStore({ sessions: [morning], settings });
    const { result } = await renderHook(() => useSessionMutations(store, scheduleTime, submit));

    store.replace({ sessions: [morning, session('session-2', 11, 12)], settings });
    const outcome = await result.current.resize(morning, local(12));

    expect(outcome.status).toBe('adjusted');
  });
});
