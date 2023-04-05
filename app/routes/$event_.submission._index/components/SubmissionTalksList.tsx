import { InboxIcon } from '@heroicons/react/24/outline';
import { ButtonLink } from '~/design-system/Buttons';
import { EmptyState } from '~/design-system/EmptyState';
import { TalkCard } from '~/shared-components/TalkCard';

type Props = {
  talks: Array<{
    id: string;
    title: string;
    isDraft: boolean;
    speakers: Array<{
      id: string;
      name: string | null;
      photoURL?: string | null;
    }>;
  }>;
};

export function SubmissionTalksList({ talks }: Props) {
  if (talks.length === 0) {
    return (
      <EmptyState icon={InboxIcon} label="Nothing to submit!">
        <ButtonLink to="new">Create a new proposal</ButtonLink>
      </EmptyState>
    );
  }

  return (
    <ul aria-label="Talks list" className="grid grid-cols-1 gap-6 pb-2 sm:grid-cols-2">
      {talks.map((talk) => (
        <TalkCard key={talk.id} {...talk} isCfpOpen />
      ))}
    </ul>
  );
}
