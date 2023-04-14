import { InboxIcon } from '@heroicons/react/24/outline';
import { EmptyState } from '~/design-system/layouts/EmptyState';
import { ProposalCard } from '~/shared-components/proposals/ProposalCard';

type Props = {
  talks: Array<{
    id: string;
    title: string;
    speakers: Array<{
      id: string;
      name: string | null;
      photoURL?: string | null;
    }>;
  }>;
};

export function SubmissionTalksList({ talks }: Props) {
  if (talks.length === 0) {
    return <EmptyState icon={InboxIcon} label="Nothing to submit!" />;
  }

  return (
    <ul aria-label="Talks list" className="grid grid-cols-1 gap-6 pb-2 sm:grid-cols-2">
      {talks.map((talk) => (
        <ProposalCard key={talk.id} {...talk} />
      ))}
    </ul>
  );
}
