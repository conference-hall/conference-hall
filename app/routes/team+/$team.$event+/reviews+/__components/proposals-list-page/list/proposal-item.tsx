import { Link, useSearchParams } from '@remix-run/react';
import type { ChangeEvent } from 'react';

import { BadgeDot } from '~/design-system/badges.tsx';
import { Checkbox } from '~/design-system/forms/checkboxes.tsx';
import { Text } from '~/design-system/typography.tsx';
import { GlobalReviewNote, UserReviewNote } from '~/routes/__components/reviews/review-note.tsx';

import { format } from 'date-fns';
import { useCurrentTeam } from '~/routes/__components/contexts/team-context.tsx';
import { ReviewComments } from '~/routes/__components/reviews/review-comments';
import { Tag } from '~/routes/__components/tags/tag.tsx';
import { ClientOnly } from '~/routes/__components/utils/client-only.tsx';
import type { ProposalData } from './types';

type ProposalItemProps = {
  proposal: ProposalData;
  isSelected: boolean;
  isAllPagesSelected: boolean;
  toggle: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function ProposalItem({ proposal, isSelected, isAllPagesSelected, toggle }: ProposalItemProps) {
  const [params] = useSearchParams();

  const currentTeam = useCurrentTeam();
  const { canDeliberateEventProposals } = currentTeam.userPermissions;

  const { id, title, reviews } = proposal;
  const { you, summary } = reviews;

  return (
    <>
      {canDeliberateEventProposals ? (
        <Checkbox
          aria-label={`Select proposal "${title}"`}
          value={id}
          checked={isSelected}
          disabled={isAllPagesSelected}
          onChange={toggle}
          className="self-start pt-[15px] pr-4"
        />
      ) : undefined}

      <Link
        to={{ pathname: id, search: params.toString() }}
        aria-label={`Open proposal "${title}"`}
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
            {proposal.speakers.length ? `by ${proposal.speakers.map((a) => a.name).join(', ')}` : null}
            <ClientOnly>{() => format(proposal.createdAt, " 'on' MMM d, y")}</ClientOnly>
          </Text>
        </div>

        <div className="hidden sm:flex sm:items-center sm:gap-2 sm:[&>*]:w-14">
          <ReviewComments count={proposal.comments.count} />
          <UserReviewNote feeling={you.feeling} note={you.note} />
          {summary && <GlobalReviewNote feeling="NEUTRAL" note={summary.average} hideEmpty />}
        </div>
      </Link>
    </>
  );
}

function deliberationBadge({ deliberationStatus, confirmationStatus }: ProposalData) {
  if (confirmationStatus) return null;

  switch (deliberationStatus) {
    case 'ACCEPTED':
      return (
        <BadgeDot pill compact color="green">
          Accepted
        </BadgeDot>
      );
    case 'REJECTED':
      return (
        <BadgeDot pill compact color="red">
          Rejected
        </BadgeDot>
      );
    case 'PENDING':
      return null;
  }
}

function publicationBadge({ deliberationStatus, publicationStatus, confirmationStatus }: ProposalData) {
  if (deliberationStatus === 'PENDING') return null;

  if (deliberationStatus === 'ACCEPTED' && publicationStatus === 'PUBLISHED' && confirmationStatus === 'PENDING') {
    return (
      <BadgeDot pill compact color="blue">
        Waiting for confirmation
      </BadgeDot>
    );
  } else if (
    deliberationStatus === 'ACCEPTED' &&
    publicationStatus === 'PUBLISHED' &&
    confirmationStatus === 'CONFIRMED'
  ) {
    return (
      <BadgeDot pill compact color="green">
        Confirmed by speakers
      </BadgeDot>
    );
  } else if (
    deliberationStatus === 'ACCEPTED' &&
    publicationStatus === 'PUBLISHED' &&
    confirmationStatus === 'DECLINED'
  ) {
    return (
      <BadgeDot pill compact color="red">
        Declined by speakers
      </BadgeDot>
    );
  } else if (publicationStatus === 'NOT_PUBLISHED') {
    return (
      <BadgeDot pill compact color="gray">
        Not published
      </BadgeDot>
    );
  }
  return null;
}
