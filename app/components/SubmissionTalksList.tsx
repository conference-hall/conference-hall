import { ExclamationCircleIcon, InboxIcon } from '@heroicons/react/24/outline';
import { AvatarGroup } from '~/design-system/Avatar';
import { ButtonLink } from '~/design-system/Buttons';
import { CardLink } from '~/design-system/Card';
import { EmptyState } from '~/design-system/EmptyState';
import { IconLabel } from '~/design-system/IconLabel';

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
      <EmptyState icon={InboxIcon} label="Nothing to submit!" description="Get started by creating a new proposal.">
        <ButtonLink to="submission/new">Create a new proposal</ButtonLink>
      </EmptyState>
    );
  }

  return (
    <ul aria-label="Talks list" className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
      {talks.map((talk) => (
        <CardLink as="li" key={talk.id} to={`submission/${talk.id}`}>
          <div className="flex h-40 flex-col justify-between px-4 py-4 sm:px-6">
            <div>
              <p className="truncate text-base font-semibold text-indigo-600">{talk.title}</p>
              <AvatarGroup avatars={talk.speakers} displayNames className="mt-2" />
            </div>

            {talk.isDraft ? (
              <IconLabel icon={ExclamationCircleIcon} className="text-sm text-yellow-600">
                Draft proposal, don't forget to submit it.
              </IconLabel>
            ) : null}
          </div>
        </CardLink>
      ))}
    </ul>
  );
}
