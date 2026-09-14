import type { Gesture } from '../models/gesture-resolution.ts';
import { GestureStore } from './gesture-store.ts';

const DAY = new Date('2025-11-20T00:00:00.000Z').getTime();

const move = (slot: number): Gesture => ({
  kind: 'move',
  sessionId: 's1',
  dayKey: DAY,
  trackId: 'track-1',
  slot,
});

const resize = (endSlot: number): Gesture => ({
  kind: 'resize',
  sessionId: 's1',
  dayKey: DAY,
  trackId: 'track-1',
  slot: 12,
  endSlot,
});

// The slices the ghost of a day and the Session being resized subscribe to.
const daySlice = (gesture: Gesture | null) => (gesture && gesture.dayKey === DAY ? gesture : null);
const resizeSlice = (gesture: Gesture | null) =>
  gesture?.kind === 'resize' && gesture.sessionId === 's1' ? gesture.endSlot : null;

describe('GestureStore', () => {
  it('holds no gesture until one starts, and clears it back', () => {
    const store = new GestureStore();
    expect(store.get()).toBeNull();

    store.set(move(24));
    expect(store.get()).toEqual(move(24));

    store.set(null);
    expect(store.get()).toBeNull();
  });

  it('notifies once per target change, and never for the same target twice', () => {
    const store = new GestureStore();
    const listener = vi.fn();
    store.subscribe(listener);

    store.set(move(24));
    store.set(move(24));
    expect(listener).toHaveBeenCalledTimes(1);

    store.set(move(25));
    expect(listener).toHaveBeenCalledTimes(2);

    store.set(null);
    store.set(null);
    expect(listener).toHaveBeenCalledTimes(3);
  });

  it('keeps the day slice stable while the target does not change', () => {
    const store = new GestureStore();
    store.set(move(24));
    const slice = daySlice(store.get());

    store.set(move(24));

    expect(daySlice(store.get())).toBe(slice);
    expect(daySlice(store.get())).not.toBeNull();
  });

  it('keeps the resize slice stable while the end slot does not change, and drops it for another gesture', () => {
    const store = new GestureStore();
    store.set(resize(30));

    expect(resizeSlice(store.get())).toBe(30);
    store.set(resize(30));
    expect(resizeSlice(store.get())).toBe(30);

    store.set(resize(31));
    expect(resizeSlice(store.get())).toBe(31);

    store.set(move(24));
    expect(resizeSlice(store.get())).toBeNull();
  });

  it('stops notifying an unsubscribed listener', () => {
    const store = new GestureStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    unsubscribe();
    store.set(move(24));

    expect(listener).not.toHaveBeenCalled();
  });
});
