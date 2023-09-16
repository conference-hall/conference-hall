import type { LoaderFunctionArgs } from '@remix-run/node';

import { ProposalDetailsSection } from '~/routes/__components/proposals/ProposalDetailsSection';

import { useProposalReview } from './_layout';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return null;
};

export default function ProposalReviewRoute() {
  const { proposalReview } = useProposalReview();

  return <ProposalDetailsSection {...proposalReview.proposal} />;
}
