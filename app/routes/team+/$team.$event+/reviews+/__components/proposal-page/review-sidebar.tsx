import { Card } from '~/design-system/layouts/card.tsx';

import type { ProposalData } from '../../$proposal.index.tsx';
import { ConfirmationDetails } from './review-sidebar-sections/confirmation-details.tsx';
import { DeliberationSelect } from './review-sidebar-sections/deliberation-select.tsx';
import { PublicationDetails } from './review-sidebar-sections/publication-details.tsx';
import { ReviewDetails } from './review-sidebar-sections/review-details.tsx';
import { ReviewForm } from './review-sidebar-sections/review-form.tsx';

type Props = { proposal: ProposalData; reviewEnabled: boolean; canDeliberate: boolean };

export function ReviewSidebar({ proposal, reviewEnabled, canDeliberate }: Props) {
  return (
    <Card as="section" className="divide-y divide-gray-200">
      {reviewEnabled && <ReviewForm key={proposal.id} initialValues={proposal.reviews.you} />}

      <ReviewDetails review={proposal.reviews.summary} userReview={proposal.reviews.you} />

      {canDeliberate && (
        <DeliberationSelect
          deliberationStatus={proposal.deliberationStatus}
          publicationStatus={proposal.publicationStatus}
        />
      )}

      {canDeliberate && (
        <PublicationDetails
          deliberationStatus={proposal.deliberationStatus}
          publicationStatus={proposal.publicationStatus}
        />
      )}

      {canDeliberate && <ConfirmationDetails confirmationStatus={proposal.confirmationStatus} />}
    </Card>
  );
}
