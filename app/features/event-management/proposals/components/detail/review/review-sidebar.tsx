import { MinusIcon } from '@heroicons/react/20/solid';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2 } from '~/design-system/typography.tsx';
import type { ProposalData } from '../../../proposal.tsx';
import { ReviewNote } from '../../shared/review-note.tsx';
import { ProposalStatusSelect } from './proposal-status-select.tsx';
import { ReviewForm } from './review-form.tsx';

type Props = {
  proposal: ProposalData;
  reviewEnabled: boolean;
  canDeliberate: boolean;
  pageRef: React.RefObject<HTMLElement | null>;
  onShowReviews: VoidFunction;
};

export function ReviewSidebar({ proposal, reviewEnabled, canDeliberate, pageRef, onShowReviews }: Props) {
  const { t } = useTranslation();

  const { you, summary, members } = proposal.reviews || {};

  return (
    <Card as="section" className="divide-y divide-gray-200">
      {reviewEnabled ? <ReviewForm key={proposal.id} initialValues={proposal.reviews.you} pageRef={pageRef} /> : null}

      {!reviewEnabled || summary ? (
        <div className="space-y-4 p-4 lg:px-6 lg:py-4">
          {!reviewEnabled ? (
            <div className="flex items-center justify-between gap-4">
              <H2 size="s">{t('event-management.proposal-page.your-review')}</H2>
              <ReviewNote
                feeling={you.feeling}
                note={you.note}
                label={t('event-management.proposal-page.your-review')}
              />
            </div>
          ) : null}

          {summary && (
            <div className="flex items-center justify-between gap-4">
              <H2 size="s">{t('event-management.proposal-page.reviews.global')}</H2>
              {members ? (
                <button
                  type="button"
                  onClick={onShowReviews}
                  className="mr-auto cursor-pointer text-xs font-medium text-indigo-700 underline hover:text-indigo-600"
                >
                  {t('event-management.proposal-page.reviews.count', {
                    count: members.filter((review) => review.dismissedAt === null).length,
                  })}
                </button>
              ) : null}
              {summary?.average !== null ? (
                <ReviewNote
                  feeling="NEUTRAL"
                  note={summary?.average}
                  label={t('event-management.proposal-page.reviews.global')}
                />
              ) : (
                <MinusIcon className="h-4 w-4" aria-hidden />
              )}
            </div>
          )}
        </div>
      ) : null}

      {canDeliberate && (
        <div className="space-y-2 p-4 lg:px-6 lg:py-4">
          <ProposalStatusSelect
            deliberationStatus={proposal.deliberationStatus}
            publicationStatus={proposal.publicationStatus}
            confirmationStatus={proposal.confirmationStatus}
            archivedAt={proposal.archivedAt}
          />
        </div>
      )}
    </Card>
  );
}
