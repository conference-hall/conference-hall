import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { Link, useSearchParams } from '@remix-run/react';
import type { ChangeEvent } from 'react';

import { BadgeDot } from '~/design-system/badges.tsx';
import { Checkbox } from '~/design-system/forms/checkboxes.tsx';
import { Text } from '~/design-system/typography.tsx';
import { GlobalReviewNote, UserReviewNote } from '~/routes/__components/reviews/review-note.tsx';
import { useTeam } from '~/routes/team+/__components/use-team.tsx';

import { Tag } from '~/routes/__components/tags/tag.tsx';
import type { ProposalData } from './types';

type ProposalItemProps = {
  proposal: ProposalData;
  isSelected: boolean;
  isAllPagesSelected: boolean;
  toggle: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function ProposalItem({ proposal, isSelected, isAllPagesSelected, toggle }: ProposalItemProps) {
  const [params] = useSearchParams();
  const { team } = useTeam();

  const { id, title, reviews } = proposal;
  const { you, summary } = reviews;

  return (
    <>
      {team.userPermissions.canDeliberateEventProposals ? (
        <Checkbox
          aria-label={`Select proposal "${title}"`}
          value={id}
          checked={isSelected}
          disabled={isAllPagesSelected}
          onChange={toggle}
          className="pb-14 md:pb-5 pr-4"
        />
      ) : undefined}
      <Link
        to={{ pathname: id, search: params.toString() }}
        aria-label={`Open proposal "${title}"`}
        className="flex items-center justify-between gap-4 py-4 grow min-w-0"
      >
        <div className="space-y-2 md:space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Text size="base" weight="semibold">
              {title}
            </Text>

            {team.userPermissions.canDeliberateEventProposals && proposal.deliberationStatus !== 'PENDING' ? (
              <>
                {deliberationBadge(proposal)}
                {publicationBadge(proposal)}
              </>
            ) : null}

            {proposal.tags.map((tag) => (
              <Tag key={tag.id} tag={tag} />
            ))}
          </div>

          <Text size="xs" variant="secondary">
            {proposal.speakers.length ? `by ${proposal.speakers.map((a) => a.name).join(', ')}` : null}
          </Text>
        </div>
        <div className="flex gap-4 items-center">
          <div className="hidden sm:flex sm:items-center sm:gap-6">
            <UserReviewNote feeling={you.feeling} note={you.note} />
            {summary && <GlobalReviewNote feeling="NEUTRAL" note={summary.average} hideEmpty />}
          </div>
          <ChevronRightIcon className="w-5 h-5 text-gray-400" />
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
