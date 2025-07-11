import { Card } from '~/design-system/layouts/card.tsx';
import type { ProposalData } from '../../proposal.tsx';
import { ProposalStatusSelect } from './review-sidebar-sections/proposal-status-select.tsx';
import { ReviewDetails } from './review-sidebar-sections/review-details.tsx';
import { ReviewForm } from './review-sidebar-sections/review-form.tsx';

type Props = { proposal: ProposalData; reviewEnabled: boolean; canDeliberate: boolean };

export function ReviewSidebar({ proposal, reviewEnabled, canDeliberate }: Props) {
  return (
    <Card as="section" className="divide-y divide-gray-200">
      {reviewEnabled && <ReviewForm key={proposal.id} initialValues={proposal.reviews.you} />}

      <ReviewDetails review={proposal.reviews.summary} userReview={proposal.reviews.you} />

      {canDeliberate && (
        <ProposalStatusSelect
          deliberationStatus={proposal.deliberationStatus}
          publicationStatus={proposal.publicationStatus}
          confirmationStatus={proposal.confirmationStatus}
        />
      )}
    </Card>
  );
}
