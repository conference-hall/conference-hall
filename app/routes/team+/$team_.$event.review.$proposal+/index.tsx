import type { LoaderFunctionArgs } from '@remix-run/node';

import { ProposalPage } from './__components/proposal-page.tsx';
import { useProposalReview } from './_layout.tsx';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return null;
};

export default function ProposalReviewRoute() {
  const { proposal } = useProposalReview();

  return <ProposalPage proposal={proposal} />;
}
