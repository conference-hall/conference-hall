import { CalendarIcon } from '@heroicons/react/solid';
import { Link } from '@remix-run/react';
import { formatRelative } from 'date-fns';
import Badge from '../design-system/Badges';
import { IconLabel } from '../design-system/IconLabel';

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
    return <EmptyState />;
  }

  return (
    <ul aria-label="Talks list" className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {talks.map((talk) => (
        <li key={talk.id} className="col-span-1 rounded-lg border border-gray-200 bg-white">
          <Link to={talk.id} className="block rounded-lg hover:bg-indigo-50">
            <div className="flex h-40 flex-col justify-between px-4 py-4 sm:px-6">
              <div>
                <div className="flex justify-between">
                  <p className="truncate text-base font-semibold text-indigo-600">{talk.title}</p>
                  {talk.archived && <Badge rounded={false}>Archived</Badge>}
                </div>
                <div className="mt-2 flex items-center -space-x-1 overflow-hidden">
                  {talk.speakers.map((speaker) => (
                    <img
                      key={speaker.id}
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                      src={speaker.photoURL || 'http://placekitten.com/100/100'}
                      alt={speaker.name || 'Speaker'}
                    />
                  ))}
                  <span className="truncate pl-3 text-sm text-gray-500">
                    by {talk.speakers.map((s) => s.name).join(', ')}
                  </span>
                </div>
              </div>
              <div>
                <IconLabel icon={CalendarIcon} className="text-sm text-gray-500" iconClassName="text-gray-400">
                  Created&nbsp;
                  <time dateTime={talk.createdAt}>{formatRelative(new Date(talk.createdAt), new Date())}</time>
                </IconLabel>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function EmptyState() {
  return (
    <div className="py-8 text-center">
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-900">No talk abstracts yet!</h3>
      <p className="mt-1 text-sm text-gray-600">Get started by creating your first talk abstract.</p>
    </div>
  );
}
