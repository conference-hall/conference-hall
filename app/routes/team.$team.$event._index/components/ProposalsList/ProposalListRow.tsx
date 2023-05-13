import type { ProposalStatus, ReviewFeeling } from '@prisma/client';
import { Link, useSearchParams } from '@remix-run/react';
import c from 'classnames';
import type { ChangeEventHandler } from 'react';

import { ProposalStatusBadge } from '~/components/proposals/ProposalStatusBadges';
import { ReviewNote } from '~/components/reviews/ReviewNote';
import { Checkbox } from '~/design-system/forms/Checkboxes';
import { Text } from '~/design-system/Typography';

export type ProposalData = {
  id: string;
  title: string;
  status: ProposalStatus;
  speakers: (string | null)[];
  reviews: {
    summary?: { negatives: number; positives: number; average: number | null };
    you: { feeling: ReviewFeeling | null; note: number | null };
  };
};

type ProposalRowProp = {
  proposal: ProposalData;
  isSelected: boolean;
  onSelect: ChangeEventHandler<HTMLInputElement>;
};

export function ProposaListRow({ proposal, isSelected, onSelect }: ProposalRowProp) {
  const [searchParams] = useSearchParams();

  const { you, summary } = proposal.reviews;

  return (
    <tr key={proposal.id} className={c('relative hover:bg-gray-50', { 'bg-gray-50': isSelected })}>
      <td className="relative hidden w-12 rounded-lg px-4 sm:table-cell sm:w-16  sm:px-4">
        {isSelected && <div className="absolute inset-y-0 left-0 w-0.5 bg-indigo-600" />}
        <Checkbox
          aria-label={`Select proposal "${proposal.title}"`}
          value={proposal.id}
          checked={isSelected}
          onChange={onSelect}
          className="absolute left-2 top-1/2"
        />
      </td>
      <td scope="row" className="w-full max-w-0 truncate px-4 py-6 sm:w-auto sm:max-w-none sm:p-0">
        <Link
          to={{ pathname: `review/${proposal.id}`, search: searchParams.toString() }}
          aria-label={`Open proposal "${proposal.title}"`}
          className="block after:absolute after:bottom-0 after:left-16 after:right-0 after:top-0 after:z-10 after:block"
        >
          <Text size="s" strong truncate>
            {proposal.title}
          </Text>
          {proposal.speakers.length > 0 && (
            <Text size="xs" variant="secondary">
              by {proposal.speakers.join(', ')}
            </Text>
          )}
        </Link>
      </td>
      <td className="hidden w-0 px-3 py-6 text-center sm:table-cell">
        {proposal.status && (
          <div className="flex items-center justify-end gap-2">
            <ProposalStatusBadge status={proposal.status} />
          </div>
        )}
      </td>
      <td className="hidden w-0 px-3 py-6 lg:table-cell">
        <div className="flex items-center justify-around gap-4">
          {summary && <ReviewNote feeling="NEGATIVE" note={summary.negatives} />}
          {summary && <ReviewNote feeling="POSITIVE" note={summary.positives} />}
          <ReviewNote feeling="USER" note={you.note} />
        </div>
      </td>
      <td className="w-0 rounded-lg px-3 py-6 pr-4 text-right  sm:pr-6">
        {summary && <ReviewNote feeling="NEUTRAL" note={summary.average} />}
      </td>
    </tr>
  );
}
