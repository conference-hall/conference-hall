import { useOutletContext } from '@remix-run/react';

import type { ProposalData } from '../_layout.tsx';

export function useProposal() {
  return useOutletContext<{ proposal: ProposalData }>();
}
