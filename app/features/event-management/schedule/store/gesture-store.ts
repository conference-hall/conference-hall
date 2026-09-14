import { createContext, useContext, useSyncExternalStore } from 'react';
import { deepEqual } from '~/shared/utils/deep-equal.ts';
import type { Gesture } from '../models/gesture-resolution.ts';

// The live gesture of one Schedule and its target, written once per pointer event that changes the target and read
// by the ghost of the targeted day and by the Session being resized. One instance per Schedule root, never a
// module singleton, `null` on the server, never persisted: a gesture ends as a Session mutation or as nothing.

type Listener = () => void;

export class GestureStore {
  private gesture: Gesture | null = null;
  private listeners = new Set<Listener>();

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  get = (): Gesture | null => this.gesture;

  // Two consecutive pointer events resolving the same target write nothing: no notification, no render.
  set(next: Gesture | null): void {
    if (deepEqual(this.gesture, next)) return;
    this.gesture = next;
    for (const listener of this.listeners) listener();
  }
}

const GestureStoreContext = createContext<GestureStore | null>(null);

export const GestureStoreProvider = GestureStoreContext.Provider;

export function useGestureStore(): GestureStore {
  const store = useContext(GestureStoreContext);
  if (!store) throw new Error('useGestureStore must be used within a GestureStoreProvider');
  return store;
}

// Subscribes to a slice of the live gesture. The selector must return a stable value for an unchanged slice.
export function useGesture<T>(selector: (gesture: Gesture | null) => T): T {
  const store = useGestureStore();
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.get()),
    () => selector(null),
  );
}
