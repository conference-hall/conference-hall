import { useCallback, useState } from 'react';
import { href, useFetcher, useParams } from 'react-router';
import { useDebouncedCallback } from 'use-debounce';
import type { ProposalResult } from '~/features/event-management/autocomplete/types/autocomplete.types.ts';
import type { loader as AutocompleteLoader } from '../../../autocomplete/autocomplete.ts';

type UseProposalSearch = {
  results: ProposalResult[];
  isSearching: boolean;
  search: (query: string) => void;
};

/**
 * Wraps the `/autocomplete?kind=proposals` fetcher with a 300ms debounce and
 * proposal-only filtering. `isSearching` stays true through the debounce window
 * and the request round-trip so the UI never flashes stale or empty results.
 */
export function useProposalSearch(): UseProposalSearch {
  const { team, event } = useParams();
  const fetcher = useFetcher<typeof AutocompleteLoader>();
  const [pending, setPending] = useState(false);

  const load = useDebouncedCallback((query: string) => {
    const params = new URLSearchParams({ query, kind: 'proposals' });
    const route = href('/team/:team/:event/autocomplete', { team: team ?? '', event: event ?? '' });
    fetcher.load(`${route}?${params.toString()}`);
    // Request dispatched: the fetcher state now drives the indicator.
    setPending(false);
  }, 300);

  // `pending` covers the debounce window; the fetcher state covers the round-trip.
  const search = useCallback(
    (query: string) => {
      setPending(true);
      load(query);
    },
    [load],
  );

  const results = (fetcher.data ?? []).filter((item): item is ProposalResult => item.kind === 'proposals');
  const isSearching = pending || fetcher.state !== 'idle';

  return { results, isSearching, search };
}
