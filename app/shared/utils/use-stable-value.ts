// The ref is read during render on purpose: it is the cache of the last value handed out, not a DOM handle.
// oxlint-disable react/refs
import { useRef } from 'react';
import { deepEqual } from './deep-equal.ts';

// Keeps the previous reference as long as the value is equal by content: a value rebuilt on every render
// (a loader revalidation, a derived array) can then feed a memo or a context without re-rendering its readers.
export function useStableValue<T>(value: T): T {
  const ref = useRef(value);
  if (!deepEqual(ref.current, value)) ref.current = value;
  return ref.current;
}
