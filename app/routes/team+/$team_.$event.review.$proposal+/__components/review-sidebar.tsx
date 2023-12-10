import { Card } from '~/design-system/layouts/Card.tsx';

import type { ProposalData } from '../_layout';
import { DeliberationDetails } from './review-sidebar-sections/deliberation-details';
import { ReviewDetails } from './review-sidebar-sections/review-details';
import { ReviewForm } from './review-sidebar-sections/review-form';

type Props = {
  proposal: ProposalData;
  reviewEnabled: boolean;
  nextId?: string;
  canDeliberate: boolean;
};

export function ReviewSidebar({ proposal, reviewEnabled, nextId, canDeliberate }: Props) {
  return (
    <Card as="section" className="divide-y divide-gray-200">
      {reviewEnabled && <ReviewForm key={proposal.id} initialValues={proposal.reviews.you} nextId={nextId} />}

      <ReviewDetails review={proposal.reviews.summary} userReview={proposal.reviews.you} />

      {canDeliberate && (
        <DeliberationDetails
          deliberationStatus={proposal.deliberationStatus}
          publicationStatus={proposal.publicationStatus}
          confirmationStatus={proposal.confirmationStatus}
        />
      )}
    </Card>
  );
}
