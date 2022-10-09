import c from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { Text } from '~/design-system/Typography';
import { Button } from '~/design-system/Buttons';
import Badge from '~/design-system/Badges';

type Proposal = {
  id: string;
  title: string;
  speakers: (string | null)[];
  status: string;
};

type Props = { proposals: Array<Proposal>; total: number };

export function CampaignEmailList({ proposals, total }: Props) {
  const { checkbox, selection, checked, setSelected, toggleAll } = useCheckboxSelection(proposals);

  return (
    <div className="-mx-4 mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:-mx-6 md:mx-0 md:rounded-lg">
      <div className="flex h-12 flex-row items-center justify-between border-b border-gray-200 bg-gray-100 px-4 py-2 sm:px-6">
        <div className="flex flex-row items-center">
          <input
            type="checkbox"
            className="mr-4 hidden h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 sm:mr-6 sm:inline-block"
            ref={checkbox}
            checked={checked}
            onChange={toggleAll}
          />
          <div className="flex items-baseline">
            <Text className="font-medium">
              {selection.length === 0 ? `${total} proposals` : `${selection.length} selected`}
            </Text>
          </div>
        </div>
        <div className="flex flex-row items-center gap-2">
          <Button variant="secondary" size="s">
            {selection.length !== 0 ? `Send to ${selection.length} proposals` : 'Send to all proposals'}
          </Button>
        </div>
      </div>
      <div className="divide-y divide-gray-200 bg-white">
        {proposals.map((proposal) => (
          <div key={proposal.id} className={c('relative', { 'bg-gray-50': selection.includes(proposal) })}>
            {selection.includes(proposal) && <div className="absolute inset-y-0 left-0 w-0.5 bg-indigo-600" />}
            <input
              type="checkbox"
              className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 sm:left-6"
              value={proposal.id}
              checked={selection.includes(proposal)}
              onChange={(e) =>
                setSelected(e.target.checked ? [...selection, proposal] : selection.filter((p) => p !== proposal))
              }
            />
            <div className="ml-16 mr-6 flex justify-between py-4">
              <div>
                <Text className="truncate font-medium">{proposal.title}</Text>
                <Text className="truncate font-normal text-gray-700" size="xs">
                  by {proposal.speakers.join(', ')}
                </Text>
              </div>
              <div className="flex flex-row items-center gap-2">
                <Badge>{proposal.status.toLowerCase()}</Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
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
