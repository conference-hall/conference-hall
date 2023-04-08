import { InboxIcon } from '@heroicons/react/24/outline';
import { ButtonLink } from '~/design-system/Buttons';
import { EmptyState } from '~/design-system/EmptyState';
import { ProposalCard } from '~/shared-components/proposals/ProposalCard';

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
    return (
      <EmptyState icon={InboxIcon} label="You don't have talk abstracts yet.">
        <ButtonLink to="new" variant="secondary">
          Create a new talk
        </ButtonLink>
      </EmptyState>
    );
  }

  return (
    <ul aria-label="Talks list" className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {talks.map((talk) => (
        <ProposalCard key={talk.id} id={talk.id} title={talk.title} speakers={talk.speakers} />
      ))}
    </ul>
  );
}
