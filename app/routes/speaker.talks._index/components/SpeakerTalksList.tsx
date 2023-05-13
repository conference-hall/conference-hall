import { InboxIcon } from '@heroicons/react/24/outline';

import { ProposalCard } from '~/components/proposals/ProposalCard';
import { EmptyState } from '~/design-system/layouts/EmptyState';

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
    return <EmptyState icon={InboxIcon} label="No talks found." />;
  }

  return (
    <ul aria-label="Talks list" className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {talks.map((talk) => (
        <ProposalCard key={talk.id} id={talk.id} title={talk.title} speakers={talk.speakers} />
      ))}
    </ul>
  );
}
