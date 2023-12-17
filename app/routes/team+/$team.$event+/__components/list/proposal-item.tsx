import { CheckIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { ClockIcon } from '@heroicons/react/24/outline';
import { Link, useSearchParams } from '@remix-run/react';
import type { ChangeEvent } from 'react';

import { Checkbox } from '~/design-system/forms/Checkboxes';
import { Text } from '~/design-system/Typography';
import { Join } from '~/design-system/utils/join';
import { GlobalReviewNote, UserReviewNote } from '~/routes/__components/reviews/ReviewNote';
import { useTeam } from '~/routes/team+/__components/useTeam';

import type { ProposalData } from './types';

type ProposalItemProps = {
  proposal: ProposalData;
  isSelected: boolean;
  isAllPagesSelected: boolean;
  toggle: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function ProposalItem({ proposal, isSelected, isAllPagesSelected, toggle }: ProposalItemProps) {
  const [params] = useSearchParams();
  const { id, title, reviews } = proposal;
  const { you, summary } = reviews;

  return (
    <>
      <Checkbox
        aria-label={`Select proposal "${title}"`}
        value={id}
        checked={isSelected}
        disabled={isAllPagesSelected}
        onChange={toggle}
        className="px-4 pb-5 sm:pl-6 sm:pr-4"
      />
      <Link
        to={{ pathname: `review/${id}`, search: params.toString() }}
        aria-label={`Open proposal "${title}"`}
        className="flex items-center justify-between gap-4 pr-4 py-4 sm:pr-6 grow min-w-0"
      >
        <div className="space-y-1 min-w-0">
          <Text weight="semibold" truncate>
            {title}
          </Text>
          <div className="flex gap-1">
            <ProposalDetails proposal={proposal} />
          </div>
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

function ProposalDetails({ proposal }: { proposal: ProposalData }) {
  const { team } = useTeam();
  const { speakers } = proposal;

  if (team.role === 'REVIEWER') {
    return (
      <Text size="xs" variant="secondary">
        <Join separator={<span> • </span>}>
          {speakers.length ? `by ${speakers.map((a) => a.name).join(', ')}` : null}
          {reviewLabel(proposal)}
        </Join>
      </Text>
    );
  }

  return (
    <Text size="xs" variant="secondary">
      <Join separator={<span> • </span>}>
        {speakers.length ? `by ${speakers.map((a) => a.name).join(', ')}` : null}
        {deliberationLabel(proposal)}
        {confirmationLabel(proposal)}
      </Join>
      {deliberationIcon(proposal)}
    </Text>
  );
}

function reviewLabel({ reviews }: ProposalData) {
  if (reviews.you.note !== null) {
    return 'Reviewed';
  }
  return 'Not reviewed';
}

function deliberationLabel({ deliberationStatus, publicationStatus, confirmationStatus }: ProposalData) {
  if (confirmationStatus) return null;
  switch (deliberationStatus) {
    case 'ACCEPTED':
      return publicationStatus === 'PUBLISHED' ? 'Accepted (published)' : 'Accepted (not published)';
    case 'REJECTED':
      return publicationStatus === 'PUBLISHED' ? 'Rejected (published)' : 'Rejected (not published)';
    case 'PENDING':
      return 'Pending';
  }
}

function confirmationLabel({ deliberationStatus, confirmationStatus }: ProposalData) {
  if (deliberationStatus === 'ACCEPTED' && confirmationStatus === 'PENDING') {
    return 'Waiting for confirmation';
  } else if (deliberationStatus === 'ACCEPTED' && confirmationStatus === 'CONFIRMED') {
    return 'Confirmed by speakers';
  } else if (deliberationStatus === 'ACCEPTED' && confirmationStatus === 'DECLINED') {
    return 'Declined by speakers';
  }
  return null;
}

function deliberationIcon({ deliberationStatus, confirmationStatus }: ProposalData) {
  if (deliberationStatus === 'ACCEPTED' && confirmationStatus === 'PENDING') {
    return <ClockIcon className="inline ml-1 mb-0.5 w-4 h-4 text-gray-600" aria-hidden />;
  } else if (deliberationStatus === 'REJECTED' || confirmationStatus === 'DECLINED') {
    return <XMarkIcon className="inline ml-0.5 mb-0.5 w-4 h-4 text-red-600" aria-hidden />;
  } else if (deliberationStatus === 'ACCEPTED' || confirmationStatus === 'CONFIRMED') {
    return <CheckIcon className="inline ml-0.5 mb-0.5 w-4 h-4 text-green-600" aria-hidden />;
  }
  return null;
}
