import { InboxIcon } from '@heroicons/react/24/outline';
import { AvatarGroup } from '~/design-system/Avatar';
import { ButtonLink } from '~/design-system/Buttons';
import { CardLink } from '~/design-system/Card';
import { EmptyState } from '~/design-system/EmptyState';
import { DraftLabel } from '../../$event.proposals._index/components/ProposalStatusLabel';

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
    <ul aria-label="Talks list" className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
      {talks.map((talk) => (
        <CardLink as="li" key={talk.id} to={talk.id}>
          <div className="flex h-40 flex-col justify-between px-4 py-4 sm:px-6">
            <div>
              <p className="truncate text-base font-semibold text-indigo-600">{talk.title}</p>
              <AvatarGroup avatars={talk.speakers} displayNames />
            </div>
            {talk.isDraft && <DraftLabel />}
          </div>
        </CardLink>
      ))}
    </ul>
  );
}
