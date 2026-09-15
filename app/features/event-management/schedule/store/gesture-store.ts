import { createContext, useContext, useSyncExternalStore } from 'react';
import { deepEqual } from '~/shared/utils/deep-equal.ts';
import type { Gesture } from '../models/gesture-resolution.ts';

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

  get = () => this.gesture;

  // Two consecutive pointer events resolving the same target write nothing: no notification, no render.
  set(next: Gesture | null) {
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

export function useGesture<T>(selector: (gesture: Gesture | null) => T): T {
  const store = useGestureStore();
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.get()),
    () => selector(null),
  );
}
