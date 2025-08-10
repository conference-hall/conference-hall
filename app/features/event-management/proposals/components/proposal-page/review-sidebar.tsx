import { useTranslation } from 'react-i18next';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2 } from '~/design-system/typography.tsx';
import type { ProposalData } from '../../proposal.tsx';
import { GlobalReviewNote } from '../review-note.tsx';
import { ProposalStatusSelect } from './review-sidebar-sections/proposal-status-select.tsx';
import { ReviewForm } from './review-sidebar-sections/review-form.tsx';

type Props = { proposal: ProposalData; reviewEnabled: boolean; canDeliberate: boolean };

export function ReviewSidebar({ proposal, reviewEnabled, canDeliberate }: Props) {
  const { t } = useTranslation();

  const { you, summary } = proposal.reviews || {};

  return (
    <Card as="section" className="divide-y divide-gray-200">
      {reviewEnabled ? <ReviewForm key={proposal.id} initialValues={proposal.reviews.you} /> : null}

      <div className="space-y-4 p-4 lg:px-6 lg:py-4">
        {!reviewEnabled ? (
          <div className="flex items-center justify-between gap-4">
            <H2 size="s">{t('event-management.proposal-page.your-review')}</H2>
            <GlobalReviewNote feeling={you.feeling} note={you.note} />
          </div>
        ) : null}

        {summary && (
          <div className="flex items-center justify-between gap-4">
            <H2 size="s">{t('event-management.proposal-page.reviews.global')}</H2>
            <GlobalReviewNote feeling="NEUTRAL" note={summary?.average} />
          </div>
        )}
      </div>

      {canDeliberate && (
        <div className="space-y-2 p-4 lg:px-6 lg:py-4">
          <ProposalStatusSelect
            deliberationStatus={proposal.deliberationStatus}
            publicationStatus={proposal.publicationStatus}
            confirmationStatus={proposal.confirmationStatus}
          />
        </div>
      )}
    </Card>
  );
}
