import { InboxIcon } from '@heroicons/react/24/outline';
import { EmptyState } from '~/design-system/layouts/EmptyState';
import { ProposalCard } from '~/shared-components/proposals/ProposalCard';

type Props = {
  talks: Array<{
    id: string;
    title: string;
    archived: boolean;
    speakers: Array<{
      id: string;
      name: string | null;
      picture?: string | null;
    }>;
  }>;
};

export function SpeakerTalksList({ talks }: Props) {
  if (talks.length === 0) {
    return <EmptyState icon={InboxIcon} label="You don't have talk abstracts yet." />;
  }

  return (
    <ul aria-label="Talks list" className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {talks.map((talk) => (
        <ProposalCard key={talk.id} id={talk.id} title={talk.title} speakers={talk.speakers} />
      ))}
    </ul>
  );
}
