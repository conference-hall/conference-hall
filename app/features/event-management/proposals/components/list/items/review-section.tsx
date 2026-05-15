import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { Text } from '~/design-system/typography.tsx';
import type { GlobalReview, UserReview } from '~/shared/types/proposals.types.ts';
import { ReviewNote } from '../../shared/review-note.tsx';

type ReviewSectionProps = {
  reviews: { summary?: GlobalReview; you: UserReview };
  commentCount: number;
};

export function ReviewSection({ reviews, commentCount }: ReviewSectionProps) {
  const { t } = useTranslation();
  const { you, summary } = reviews;

  return (
    <div className="flex items-center gap-4">
      {commentCount > 0 ? <ReviewComments count={commentCount} /> : null}
      <div className="flex items-center divide-x rounded-lg border border-gray-200 bg-white py-1">
        <div className="flex items-center gap-2 px-2.5">
          <span className="text-[10px] font-semibold text-gray-400 uppercase">{t('common.you')}</span>
          <ReviewNote feeling={you.feeling} note={you.note} size="xs" />
        </div>
        {summary ? (
          <div className="flex items-center gap-2.5 px-2.5">
            <span className="text-[10px] font-semibold text-gray-400 uppercase">{t('common.team')}</span>
            <ReviewNote feeling="POSITIVE" note={summary.positives} size="xs" raw />
            <ReviewNote feeling="NEUTRAL" note={summary.average} size="xs" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

type ReviewCommentsProps = { count: number };

function ReviewComments({ count }: ReviewCommentsProps) {
  const { t } = useTranslation();

  return (
    <div className={cx('flex items-center justify-end gap-1')}>
      <Text weight="semibold" size="xs">
        {count}
      </Text>
      <ChatBubbleLeftIcon
        className="size-4 shrink-0 text-gray-600"
        aria-label={t('event-management.proposals.list.comments', { count })}
      />
    </div>
  );
}
