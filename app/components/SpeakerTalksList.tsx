import { CalendarIcon, InboxIcon } from '@heroicons/react/24/outline';
import { formatRelative } from 'date-fns';
import { AvatarGroup } from '~/design-system/Avatar';
import Badge from '~/design-system/Badges';
import { CardLink } from '~/design-system/Card';
import { EmptyState } from '~/design-system/EmptyState';
import { IconLabel } from '~/design-system/IconLabel';

type Props = {
  talks: Array<{
    id: string;
    title: string;
    archived: boolean;
    createdAt: string;
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
      <EmptyState
        icon={InboxIcon}
        label="No talk abstracts yet!"
        description="Get started by creating your first talk abstract."
      />
    );
  }

  return (
    <ul aria-label="Talks list" className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {talks.map((talk) => (
        <CardLink as="li" key={talk.id} to={`talks/${talk.id}`}>
          <div className="flex h-40 flex-col justify-between px-4 py-4 sm:px-6">
            <div>
              <div className="flex justify-between">
                <p className="truncate text-base font-semibold text-indigo-600">{talk.title}</p>
                {talk.archived && <Badge rounded={false}>Archived</Badge>}
              </div>
              <AvatarGroup avatars={talk.speakers} displayNames className="mt-2" />
            </div>
            <div>
              <IconLabel icon={CalendarIcon} className="text-sm text-gray-500" iconClassName="text-gray-400">
                Created&nbsp;
                <time dateTime={talk.createdAt}>{formatRelative(new Date(talk.createdAt), new Date())}</time>
              </IconLabel>
            </div>
          </div>
        </CardLink>
      ))}
    </ul>
  );
}
