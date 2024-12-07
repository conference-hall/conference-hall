import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Link } from 'react-router';
import { Text } from '~/design-system/typography.tsx';
import { GlobalReviewNote } from '~/routes/__components/reviews/review-note.tsx';

type OtherProposalsDisclosureProps = {
  proposals: Array<{
    id: string;
    title: string;
    review: number | null;
    speakers: Array<string>;
  }>;
};

export function OtherProposalsDisclosure({ proposals }: OtherProposalsDisclosureProps) {
  if (proposals.length === 0) return null;

  return (
    <Disclosure defaultOpen={false}>
      <DisclosureButton className="group px-6 py-4 flex items-center gap-2 text-sm font-medium leading-6 text-gray-900 cursor-pointer hover:underline border-t border-t-gray-200">
        <span>Other proposals by speakers ({proposals.length})</span>
        <ChevronDownIcon className="h-4 w-4 group-data-[open]:rotate-180" />
      </DisclosureButton>

      <DisclosurePanel as="ul" className="px-6 pb-4 ">
        {proposals.map((proposal) => (
          <li key={proposal.id}>
            <Link
              to={`../${proposal.id}`}
              relative="path"
              className="flex justify-between gap-4 hover:bg-gray-50 rounded-md w-full p-2"
            >
              <span>
                <Text>{proposal.title}</Text>
                <Text size="xs" variant="secondary">
                  {proposal.speakers.join(', ')}
                </Text>
              </span>
              <GlobalReviewNote feeling="NEUTRAL" note={proposal.review} hideEmpty />
            </Link>
          </li>
        ))}
      </DisclosurePanel>
    </Disclosure>
  );
}
