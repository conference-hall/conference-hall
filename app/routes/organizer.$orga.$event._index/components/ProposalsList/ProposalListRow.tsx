import c from 'classnames';
import { HeartIcon, StarIcon, XCircleIcon } from '@heroicons/react/24/outline';
import type { ChangeEventHandler } from 'react';
import { Link, useSearchParams } from '@remix-run/react';
import { IconLabel } from '~/design-system/IconLabel';
import { Text } from '~/design-system/Typography';
import { Checkbox } from '~/design-system/forms/Checkboxes';
import { ProposalStatusBadge } from '~/shared-components/proposals/ProposalStatusBadges';
import type { ProposalStatus } from '@prisma/client';

export type ProposalData = {
  id: string;
  title: string;
  status: ProposalStatus;
  speakers: (string | null)[];
  ratings: {
    summary?: { negatives: number; positives: number; average: number | null };
    you: { rating: number | null };
  };
};

type ProposalRowProp = {
  proposal: ProposalData;
  isSelected: boolean;
  onSelect: ChangeEventHandler<HTMLInputElement>;
};

export function ProposaListRow({ proposal, isSelected, onSelect }: ProposalRowProp) {
  const [searchParams] = useSearchParams();

  const { you, summary } = proposal.ratings;

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
          {summary && <IconLabel icon={XCircleIcon}>{summary.negatives}</IconLabel>}
          {summary && <IconLabel icon={HeartIcon}>{summary.positives}</IconLabel>}
          <IconLabel icon={StarIcon}>{formatRating(you.rating)}</IconLabel>
        </div>
      </td>
      <td className="w-0 rounded-lg px-3 py-6 pr-4 text-right  sm:pr-6">
        {summary && <Text variant="secondary">{formatRating(summary.average)}</Text>}
      </td>
    </tr>
  );
}

function formatRating(rating: number | null) {
  if (rating === null) return '-';
  return (Math.round(rating * 10) / 10)
    .toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })
    .replace(/\.0$/, '');
}
