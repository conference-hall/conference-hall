import type { LoaderArgs } from '@remix-run/node';
import { ProposalDetailsSection } from '~/shared-components/proposals/ProposalDetailsSection';
import { useProposalReview } from '../team_.$team.$event.review.$proposal/route';

export const loader = async ({ request }: LoaderArgs) => {
  return null;
};

export default function ProposalReviewRoute() {
  const { proposalReview } = useProposalReview();

  return <ProposalDetailsSection {...proposalReview.proposal} />;
}
