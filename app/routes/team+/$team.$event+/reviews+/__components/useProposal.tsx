import { useOutletContext } from '@remix-run/react';

import type { ProposalData } from '../$proposal.index';

export function useProposal() {
  return useOutletContext<{ proposal: ProposalData }>();
}
