import { href, useSearchParams } from 'react-router';

type Params = { team: string; event: string; previous?: string; next?: string };

export function useProposalNavigation({ team, event, previous, next }: Params) {
  const [searchParams] = useSearchParams();

  const previousPath = previous
    ? href('/team/:team/:event/proposals/:proposal', { team, event, proposal: previous })
    : undefined;

  const nextPath = next ? href('/team/:team/:event/proposals/:proposal', { team, event, proposal: next }) : undefined;

  return { previousPath, nextPath, search: searchParams.toString() };
}
