import type { LoaderArgs } from '@remix-run/node';

import { ProposalDetailsSection } from '~/routes/__components/proposals/ProposalDetailsSection';

import { useProposalReview } from './_layout';

export const loader = async ({ request }: LoaderArgs) => {
  return null;
};

export default function ProposalReviewRoute() {
  const { proposalReview } = useProposalReview();

  return <ProposalDetailsSection {...proposalReview.proposal} />;
}
