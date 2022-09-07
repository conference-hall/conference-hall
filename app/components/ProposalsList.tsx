import c from 'classnames';
import { HeartIcon, StarIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '~/design-system/Badges';
import { IconLabel } from '~/design-system/IconLabel';
import { Text } from '~/design-system/Typography';
import { Button } from '~/design-system/Buttons';

type Proposal = {
  id: string;
  title: string;
  status: string;
  speakers: (string | null)[];
  ratings: { hates: number; loves: number; you: number; total: number };
};

type Props = { proposals: Array<Proposal> };

export function ProposalsList({ proposals }: Props) {
  const { checkbox, selection, checked, setSelected, toggleAll } = useCheckboxSelection(proposals);

  return (
    <div className="-mx-4 mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:-mx-6 md:mx-0 md:rounded-lg">
      <div className="flex flex-row items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 sm:px-6">
        <div className="flex flex-row items-center">
          <input
            type="checkbox"
            className="mr-4 hidden h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 sm:mr-6 sm:inline-block"
            ref={checkbox}
            checked={checked}
            onChange={toggleAll}
          />
          <div className="flex items-baseline">
            {selection.length === 0 ? (
              <Text className="font-medium">{proposals.length} proposals</Text>
            ) : (
              <Text className="font-medium">{selection.length} selected</Text>
            )}
          </div>
        </div>
        <div className="flex flex-row items-center gap-2">
          <Button variant="secondary" size="small" disabled={selection.length === 0}>
            Mark as...
          </Button>
          <Button variant="secondary" size="small" disabled={selection.length === 0}>
            Export
          </Button>
        </div>
      </div>
      <table className="min-w-full">
        <thead className="sr-only">
          <tr>
            <th scope="col" className="hidden sm:table-cell">
              Select a proposal
            </th>
            <th scope="col">Proposal details</th>
            <th scope="col" className="hidden sm:table-cell">
              Status
            </th>
            <th scope="col" className="hidden lg:table-cell">
              Rating details
            </th>
            <th scope="col" className="hidden sm:table-cell">
              Final rating
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {proposals.map((proposal: any) => (
            <tr
              key={proposal.id}
              className={c('relative hover:bg-gray-50', { 'bg-gray-50': selection.includes(proposal) })}
            >
              <td className="relative hidden w-12 px-6 sm:table-cell sm:w-16 sm:px-8">
                {selection.includes(proposal) && <div className="absolute inset-y-0 left-0 w-0.5 bg-indigo-600" />}
                <input
                  type="checkbox"
                  className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 sm:left-6"
                  value={proposal.id}
                  checked={selection.includes(proposal)}
                  onChange={(e) =>
                    setSelected(
                      e.target.checked ? [...selection, proposal] : selection.filter((p: any) => p !== proposal)
                    )
                  }
                />
              </td>
              <td scope="row" className="w-full max-w-0 truncate py-4 px-4 sm:w-auto sm:max-w-none sm:p-0">
                <Link
                  to="/"
                  aria-label={`Go to proposal "${proposal.title}"`}
                  className="block after:absolute after:top-0 after:bottom-0 after:left-16 after:right-0 after:z-10 after:block"
                >
                  <Text className="truncate font-medium">{proposal.title}</Text>
                  <Text className="truncate font-normal text-gray-700" size="xs">
                    by {proposal.speakers.join(', ')}
                  </Text>
                </Link>
              </td>
              <td className="hidden w-0 px-3 py-4 text-center sm:table-cell">
                {proposal.status && (
                  <div className="flex items-center justify-end gap-2">
                    <Badge>{proposal.status?.toLowerCase()}</Badge>
                  </div>
                )}
              </td>
              <td className="hidden w-0 px-3 py-4 lg:table-cell">
                <div className="flex items-center justify-around gap-4">
                  <IconLabel icon={XCircleIcon} iconClassName="text-gray-400">
                    {proposal.ratings.hates}
                  </IconLabel>
                  <IconLabel icon={HeartIcon} iconClassName="text-gray-400">
                    {proposal.ratings.loves}
                  </IconLabel>
                  <IconLabel icon={StarIcon} iconClassName="text-gray-400">
                    {proposal.ratings.you}
                  </IconLabel>
                </div>
              </td>
              <td className="w-0 px-3 py-4 pr-4 text-right sm:pr-6">
                <Text variant="secondary" className="ml-2 text-base font-semibold">
                  {proposal.ratings.total}
                </Text>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function useCheckboxSelection(proposals: Array<Proposal>) {
  const checkbox = useRef<HTMLInputElement>(null);
  const [checked, setChecked] = useState(false);
  const [selection, setSelected] = useState<Array<Proposal>>([]);
  const [indeterminate, setIndeterminate] = useState(false);

  useEffect(() => {
    const isIndeterminate = selection.length > 0 && selection.length < proposals.length;
    setChecked(proposals.length !== 0 && selection.length === proposals.length);
    setIndeterminate(isIndeterminate);
    checkbox!.current!.indeterminate = isIndeterminate;
  }, [selection, proposals]);

  function toggleAll() {
    setSelected(checked || indeterminate ? [] : proposals);
    setChecked(!checked && !indeterminate);
    setIndeterminate(false);
  }

  return { checkbox, selection, checked, setSelected, toggleAll };
}
