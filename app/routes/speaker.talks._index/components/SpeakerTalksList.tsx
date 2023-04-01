import { InboxIcon } from '@heroicons/react/24/outline';
import { EmptyState } from '~/design-system/EmptyState';
import { TalkCard } from '~/shared-components/TalkCard';

type Props = {
  talks: Array<{
    id: string;
    title: string;
    archived: boolean;
    speakers: Array<{
      id: string;
      name: string | null;
      photoURL?: string | null;
    }>;
  }>;
};

export function SpeakerTalksList({ talks }: Props) {
  if (talks.length === 0) {
    return <EmptyState icon={InboxIcon} label="No talk abstracts yet!" />;
  }

  return (
    <ul aria-label="Talks list" className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {talks.map((talk) => (
        <TalkCard key={talk.id} id={talk.id} title={talk.title} speakers={talk.speakers} isArchived={talk.archived} />
      ))}
    </ul>
  );
}
