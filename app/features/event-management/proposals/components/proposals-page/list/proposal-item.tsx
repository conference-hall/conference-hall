import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router';
import { BadgeDot } from '~/design-system/badges.tsx';
import { Checkbox } from '~/design-system/forms/checkboxes.tsx';
import { Tag } from '~/design-system/tag.tsx';
import { Text } from '~/design-system/typography.tsx';
import { ClientOnly } from '~/design-system/utils/client-only.tsx';
import { useCurrentEventTeam } from '~/features/event-management/event-team-context.tsx';
import { ReviewComments } from '~/features/event-management/proposals/components/proposals-page/list/review-comments.tsx';
import { GlobalReviewNote, UserReviewNote } from '~/features/event-management/proposals/components/review-note.tsx';
import { formatDate } from '~/shared/datetimes/datetimes.ts';
import type { ProposalData } from './types.ts';

type ProposalItemProps = {
  proposal: ProposalData;
  isSelected?: boolean;
  isAllPagesSelected?: boolean;
  toggle?: (event: ChangeEvent<HTMLInputElement>) => void;
  linkTo?: string;
};

export function ProposalItem({
  proposal,
  isSelected = false,
  isAllPagesSelected = false,
  toggle,
  linkTo,
}: ProposalItemProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const [params] = useSearchParams();

  const { team } = useCurrentEventTeam();
  const { canChangeProposalStatus } = team.userPermissions;

  const { id, title, reviews } = proposal;
  const { you, summary } = reviews;

  const defaultLinkTo = linkTo || { pathname: id, search: params.toString() };

  return (
    <>
      {canChangeProposalStatus && toggle ? (
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
        to={defaultLinkTo}
        aria-label={t('event-management.proposals.list.open', { title })}
        className="flex items-center justify-between gap-4 py-3 grow min-w-0 hover:text-indigo-700"
      >
        <div className="space-y-2 md:space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{title}</span>

            {canChangeProposalStatus && proposal.deliberationStatus !== 'PENDING' && (
              <>
                <DeliberationBadge {...proposal} />
                <PublicationBadge {...proposal} />
              </>
            )}

            {proposal.tags.map((tag) => (
              <Tag key={tag.id} tag={tag} isSearchLink={false} />
            ))}
          </div>

          <Text size="xs" variant="secondary">
            {proposal.speakers.length ? t('common.by', { names: proposal.speakers.map((a) => a.name) }) : null}
            <ClientOnly>{() => ` - ${formatDate(proposal.createdAt, { format: 'medium', locale })}`}</ClientOnly>
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

function DeliberationBadge({ deliberationStatus, confirmationStatus }: ProposalData) {
  const { t } = useTranslation();

  if (confirmationStatus) return null;

  switch (deliberationStatus) {
    case 'ACCEPTED':
      return (
        <BadgeDot pill compact color="green">
          {t('common.proposals.status.accepted')}
        </BadgeDot>
      );
    case 'REJECTED':
      return (
        <BadgeDot pill compact color="red">
          {t('common.proposals.status.rejected')}
        </BadgeDot>
      );
    case 'PENDING':
      return null;
  }
}

function PublicationBadge({ deliberationStatus, publicationStatus, confirmationStatus }: ProposalData) {
  const { t } = useTranslation();

  if (deliberationStatus === 'PENDING') return null;

  if (deliberationStatus === 'ACCEPTED' && publicationStatus === 'PUBLISHED' && confirmationStatus === 'PENDING') {
    return (
      <BadgeDot pill compact color="blue">
        {t('common.proposals.status.not-answered')}
      </BadgeDot>
    );
  } else if (
    deliberationStatus === 'ACCEPTED' &&
    publicationStatus === 'PUBLISHED' &&
    confirmationStatus === 'CONFIRMED'
  ) {
    return (
      <BadgeDot pill compact color="green">
        {t('common.proposals.status.confirmed')}
      </BadgeDot>
    );
  } else if (
    deliberationStatus === 'ACCEPTED' &&
    publicationStatus === 'PUBLISHED' &&
    confirmationStatus === 'DECLINED'
  ) {
    return (
      <BadgeDot pill compact color="red">
        {t('common.proposals.status.declined')}
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
