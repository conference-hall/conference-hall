import { CheckIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { ClockIcon } from '@heroicons/react/24/outline';
import { Link, useSearchParams } from '@remix-run/react';
import type { ChangeEvent } from 'react';

import { Checkbox } from '~/design-system/forms/Checkboxes';
import { Text } from '~/design-system/Typography';
import { Join } from '~/design-system/utils/join';
import { ReviewNote } from '~/routes/__components/reviews/ReviewNote';

import type { ProposalData } from '../types';

type ProposalItemProps = {
  proposal: ProposalData;
  isSelected: boolean;
  toggle: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function ProposalItem({ proposal, isSelected, toggle }: ProposalItemProps) {
  const [params] = useSearchParams();
  const { you, summary } = proposal.reviews;

  return (
    <>
      <div>
        <Checkbox
          aria-label={`Select proposal "${proposal.title}"`}
          value={proposal.id}
          checked={isSelected}
          onChange={toggle}
          className="px-4 pb-5 sm:pl-6 sm:pr-4"
        />
      </div>
      <Link
        to={{ pathname: `review/${proposal.id}`, search: params.toString() }}
        className="flex items-center justify-between gap-4 pr-4 py-4 sm:pr-6 grow"
      >
        <div className="space-y-1">
          <Text weight="semibold">{proposal.title}</Text>
          <div className="flex gap-1">
            <Text size="xs" variant="secondary">
              <Join separator={<span> • </span>}>
                {`by ${proposal.speakers.map((a) => a.name).join(', ')}`}
                {deliberationLabel(proposal)}
                {confirmationLabel(proposal)}
              </Join>
              {deliberationIcon(proposal)}
            </Text>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <div className="hidden sm:flex sm:items-center sm:gap-4">
            <ReviewNote feeling="USER" note={you.note} />
            {summary && <ReviewNote feeling="NEUTRAL" note={summary.average} />}
          </div>
          <ChevronRightIcon className="w-5 h-5 text-gray-400" />
        </div>
      </Link>
    </>
  );
}

function deliberationLabel({ deliberationStatus }: ProposalData) {
  switch (deliberationStatus) {
    case 'ACCEPTED':
      return 'Accepted';
    case 'REJECTED':
      return 'Rejected';
    case 'PENDING':
      return 'Not deliberated';
  }
}

function confirmationLabel({ confirmationStatus }: ProposalData) {
  if (confirmationStatus === 'PENDING') {
    return 'Waiting for confirmation';
  } else if (confirmationStatus === 'CONFIRMED') {
    return 'Confirmed';
  } else if (confirmationStatus === 'DECLINED') {
    return 'Declined';
  }
  return null;
}

function deliberationIcon({ deliberationStatus, confirmationStatus }: ProposalData) {
  if (confirmationStatus === 'PENDING') {
    return <ClockIcon className="inline ml-0.5 mb-0.5 w-4 h-4 text-gray-600" aria-hidden />;
  } else if (deliberationStatus === 'ACCEPTED' || confirmationStatus === 'CONFIRMED') {
    return <CheckIcon className="inline ml-0.5 mb-0.5 w-4 h-4 text-green-600" aria-hidden />;
  } else if (deliberationStatus === 'REJECTED' || confirmationStatus === 'DECLINED') {
    return <XMarkIcon className="inline ml-0.5 mb-0.5 w-4 h-4 text-red-600" aria-hidden />;
  }
  return null;
}
