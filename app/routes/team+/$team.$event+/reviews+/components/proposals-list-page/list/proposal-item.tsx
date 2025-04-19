import { format } from 'date-fns';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router';
import { BadgeDot } from '~/design-system/badges.tsx';
import { Checkbox } from '~/design-system/forms/checkboxes.tsx';
import { Text } from '~/design-system/typography.tsx';
import { useCurrentTeam } from '~/routes/components/contexts/team-context.tsx';
import { ReviewComments } from '~/routes/components/reviews/review-comments.tsx';
import { GlobalReviewNote, UserReviewNote } from '~/routes/components/reviews/review-note.tsx';
import { Tag } from '~/routes/components/tags/tag.tsx';
import { ClientOnly } from '~/routes/components/utils/client-only.tsx';
import type { ProposalData } from './types.ts';

type ProposalItemProps = {
  proposal: ProposalData;
  isSelected: boolean;
  isAllPagesSelected: boolean;
  toggle: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function ProposalItem({ proposal, isSelected, isAllPagesSelected, toggle }: ProposalItemProps) {
  const { t } = useTranslation();
  const [params] = useSearchParams();

  const currentTeam = useCurrentTeam();
  const { canDeliberateEventProposals } = currentTeam.userPermissions;

  const { id, title, reviews } = proposal;
  const { you, summary } = reviews;

  return (
    <>
      {canDeliberateEventProposals ? (
        <Checkbox
          aria-label={t('event-management.proposals.list.select-item', { title })}
          value={id}
          checked={isSelected}
          disabled={isAllPagesSelected}
          onChange={toggle}
          className="self-start pt-[15px] pr-4"
        />
      ) : undefined}

      <Link
        to={{ pathname: id, search: params.toString() }}
        aria-label={t('event-management.proposals.list.open', { title })}
        className="flex items-center justify-between gap-4 py-3 grow min-w-0 hover:text-indigo-700"
      >
        <div className="space-y-2 md:space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{title}</span>

            {canDeliberateEventProposals && proposal.deliberationStatus !== 'PENDING' ? (
              <>
                {deliberationBadge(proposal)}
                {publicationBadge(proposal)}
              </>
            ) : null}

            {proposal.tags.map((tag) => (
              <Tag key={tag.id} tag={tag} isSearchLink={false} />
            ))}
          </div>

          <Text size="xs" variant="secondary">
            {proposal.speakers.length ? t('common.by', { names: proposal.speakers.map((a) => a.name) }) : null}
            {/* todo(i18n) */}
            <ClientOnly>{() => format(proposal.createdAt, " 'on' MMM d, y")}</ClientOnly>
          </Text>
        </div>

        <div className="hidden sm:flex sm:items-center sm:gap-2 sm:*:w-14">
          <ReviewComments count={proposal.comments.count} />
          <UserReviewNote feeling={you.feeling} note={you.note} />
          {summary && <GlobalReviewNote feeling="NEUTRAL" note={summary.average} hideEmpty />}
        </div>
      </Link>
    </>
  );
}

function deliberationBadge({ deliberationStatus, confirmationStatus }: ProposalData) {
  const { t } = useTranslation();

  if (confirmationStatus) return null;

  switch (deliberationStatus) {
    case 'ACCEPTED':
      return (
        <BadgeDot pill compact color="green">
          {t('common.accepted')}
        </BadgeDot>
      );
    case 'REJECTED':
      return (
        <BadgeDot pill compact color="red">
          {t('common.rejected')}
        </BadgeDot>
      );
    case 'PENDING':
      return null;
  }
}

function publicationBadge({ deliberationStatus, publicationStatus, confirmationStatus }: ProposalData) {
  const { t } = useTranslation();

  if (deliberationStatus === 'PENDING') return null;

  if (deliberationStatus === 'ACCEPTED' && publicationStatus === 'PUBLISHED' && confirmationStatus === 'PENDING') {
    return (
      <BadgeDot pill compact color="blue">
        {t('common.waiting-for-confirmation')}
      </BadgeDot>
    );
  } else if (
    deliberationStatus === 'ACCEPTED' &&
    publicationStatus === 'PUBLISHED' &&
    confirmationStatus === 'CONFIRMED'
  ) {
    return (
      <BadgeDot pill compact color="green">
        {t('common.confirmed-by-speakers')}
      </BadgeDot>
    );
  } else if (
    deliberationStatus === 'ACCEPTED' &&
    publicationStatus === 'PUBLISHED' &&
    confirmationStatus === 'DECLINED'
  ) {
    return (
      <BadgeDot pill compact color="red">
        {t('common.declined-by-speakers')}
      </BadgeDot>
    );
  } else if (publicationStatus === 'NOT_PUBLISHED') {
    return (
      <BadgeDot pill compact color="gray">
        {t('common.not-published')}
      </BadgeDot>
    );
  }
  return null;
}
