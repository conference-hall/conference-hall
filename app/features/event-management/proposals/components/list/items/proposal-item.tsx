import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { href, Link, useSearchParams } from 'react-router';
import { useUserTeamPermissions } from '~/app-platform/components/user-context.tsx';
import { Badge, BadgeDot } from '~/design-system/badges.tsx';
import { Checkbox } from '~/design-system/forms/input-checkbox.tsx';
import { Tag } from '~/design-system/tag.tsx';
import { Text } from '~/design-system/typography.tsx';
import { ClientOnly } from '~/design-system/utils/client-only.tsx';
import { formatDate } from '~/shared/datetimes/datetimes.ts';
import { GlobalReviewNote, UserReviewNote } from '../../shared/review-note.tsx';
import type { ProposalData } from '../../shared/types.ts';
import { ReviewComments } from './review-comments.tsx';

type ProposalItemProps = {
  team: string;
  event: string;
  proposal: ProposalData;
  queryParams?: string;
  isSelected?: boolean;
  isAllPagesSelected?: boolean;
  toggle?: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function ProposalItem({
  team,
  event,
  proposal,
  queryParams,
  isSelected = false,
  isAllPagesSelected = false,
  toggle,
}: ProposalItemProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const [currentQueryParams] = useSearchParams();
  const { canChangeProposalStatus } = useUserTeamPermissions();

  const { id, proposalNumber, title, reviews, archivedAt, submittedAt, deliberationStatus, tags, speakers, comments } =
    proposal;
  const { you, summary } = reviews;

  const pathname = href('/team/:team/:event/proposals/:proposal', {
    team,
    event,
    proposal: proposalNumber ? String(proposalNumber) : id,
  });

  return (
    <>
      {canChangeProposalStatus && toggle ? (
        <Checkbox
          aria-label={t('event-management.proposals.list.select-item', { title })}
          value={id}
          checked={isSelected}
          disabled={isAllPagesSelected || archivedAt !== null}
          onChange={toggle}
          className="self-start pt-3.75 pr-4"
        />
      ) : undefined}

      <Link
        to={{ pathname, search: queryParams || currentQueryParams.toString() }}
        aria-label={t('event-management.proposals.list.open', { title })}
        className="flex min-w-0 grow items-center justify-between gap-4 py-3 hover:text-indigo-700"
      >
        <div className="min-w-0 space-y-2 md:space-y-1">
          <div className="flex flex-wrap items-center gap-x-2">
            <span className="font-semibold">{title}</span>

            {archivedAt ? <Badge pill>{t('common.archived')}</Badge> : null}

            {canChangeProposalStatus && deliberationStatus !== 'PENDING' && (
              <>
                <DeliberationBadge {...proposal} />
                <PublicationBadge {...proposal} />
              </>
            )}

            {tags.map((tag) => (
              <Tag key={tag.id} tag={tag} isSearchLink={false} />
            ))}
          </div>

          <Text size="xs" variant="secondary" className="space-x-1">
            {proposalNumber ? <span>#{proposalNumber}</span> : null}
            {speakers.length ? <span>{t('common.proposed-by', { names: speakers.map((a) => a.name) })}</span> : null}
            <ClientOnly>
              {() => <span>{` - ${formatDate(submittedAt, { format: 'medium', locale })}`}</span>}
            </ClientOnly>
          </Text>
        </div>

        <div className="hidden sm:flex sm:items-center sm:gap-2 sm:*:w-14">
          <ReviewComments count={comments.count} />
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
