import c from 'classnames';
import { HeartIcon, StarIcon, XCircleIcon } from '@heroicons/react/24/outline';
import type { ChangeEventHandler } from 'react';
import { Link, useLocation, useSearchParams } from '@remix-run/react';
import Badge from '~/design-system/Badges';
import { IconLabel } from '~/design-system/IconLabel';
import type { Proposal } from './ProposalsList';
import { Text } from '~/design-system/Typography';
import { Checkbox } from '~/design-system/forms/Checkboxes';

type ProposalRowProp = {
  proposal: Proposal;
  isSelected: boolean;
  onSelect: ChangeEventHandler<HTMLInputElement>;
};

export function ProposaListRow({ proposal, isSelected, onSelect }: ProposalRowProp) {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  return (
    <tr key={proposal.id} className={c('relative hover:bg-gray-50', { 'bg-gray-50': isSelected })}>
      <td className="relative hidden w-12 px-4 sm:table-cell sm:w-16 sm:px-4">
        {isSelected && <div className="absolute inset-y-0 left-0 w-0.5 bg-indigo-600" />}
        <Checkbox value={proposal.id} checked={isSelected} onChange={onSelect} className="absolute left-2 top-1/2" />
      </td>
      <td scope="row" className="w-full max-w-0 truncate py-6 px-4 sm:w-auto sm:max-w-none sm:p-0">
        <Link
          to={{ pathname: `${location.pathname}/${proposal.id}`, search: searchParams.toString() }}
          aria-label={`Open proposal "${proposal.title}"`}
          className="block after:absolute after:top-0 after:bottom-0 after:left-16 after:right-0 after:z-10 after:block"
        >
          <Text className="truncate font-medium">{proposal.title}</Text>
          <Text className="truncate font-normal text-gray-700" size="xs">
            by {proposal.speakers.join(', ')}
          </Text>
        </Link>
      </td>
      <td className="hidden w-0 px-3 py-6 text-center sm:table-cell">
        {proposal.status && (
          <div className="flex items-center justify-end gap-2">
            <Badge>{proposal.status?.toLowerCase()}</Badge>
          </div>
        )}
      </td>
      <td className="hidden w-0 px-3 py-6 lg:table-cell">
        <div className="flex items-center justify-around gap-4">
          <IconLabel icon={XCircleIcon} iconClassName="text-gray-400">
            {proposal.ratings.negatives}
          </IconLabel>
          <IconLabel icon={HeartIcon} iconClassName="text-gray-400">
            {proposal.ratings.positives}
          </IconLabel>
          <IconLabel icon={StarIcon} iconClassName="text-gray-400">
            {formatRating(proposal.ratings.you)}
          </IconLabel>
        </div>
      </td>
      <td className="w-0 px-3 py-6 pr-4 text-right sm:pr-6">
        <Text variant="secondary" className="ml-2 text-base font-semibold">
          {formatRating(proposal.ratings.total)}
        </Text>
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
