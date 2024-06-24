import { useMatches } from '@remix-run/react';

export function useCurrentStepKey() {
  const matches = useMatches();
  const handle = matches[matches.length - 1].handle as { step: string };
  return handle.step;
}
