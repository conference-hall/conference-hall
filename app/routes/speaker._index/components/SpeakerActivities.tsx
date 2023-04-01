import { formatRelative } from 'date-fns';
import { MicrophoneIcon, PlusIcon, XMarkIcon, CheckIcon } from '@heroicons/react/20/solid';
import { ExclamationCircleIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { IconLabel } from '../../../design-system/IconLabel';
import { Link } from '../../../design-system/Links';
import { ClientOnly } from 'remix-utils';

interface Props {
  activities: Array<{
    id: string;
    title: string;
    date: string;
    speakers: string[];
    proposals: Array<{
      eventSlug: string;
      eventName: string;
      date: string;
      status: string;
    }>;
  }>;
}

export function SpeakerActivities({ activities }: Props) {
  const hasMore = activities.length > 3;
  return (
    <div>
      {activities.map((activity) => (
        <ul key={activity.id} className="rounded-lg p-4">
          <li key={activity.id}>
            <TalkActivity
              talkId={activity.id}
              talkTitle={activity.title}
              date={activity.date}
              noSubmission={activity.proposals.length === 0}
              showTimeline={activity.proposals ? activity.proposals.length > 0 : false}
            />
          </li>
          {activity.proposals?.map((proposal, index2) => (
            <li key={proposal.eventSlug}>
              <EventActivity
                key={proposal.eventSlug}
                eventName={proposal.eventName}
                eventSlug={proposal.eventSlug}
                date={proposal.date}
                status={proposal.status}
                showTimeline={index2 < activity.proposals.length - 1 || hasMore}
              />
            </li>
          ))}
          {hasMore && (
            <li key="more">
              <MoreInfo />
            </li>
          )}
        </ul>
      ))}
    </div>
  );
}

interface ActivityItemProps {
  showTimeline?: boolean;
}

function ActivityLine() {
  return <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />;
}

interface TalkActivityProps extends ActivityItemProps {
  talkId: string;
  talkTitle: string;
  date: string;
  noSubmission: boolean;
}

function TalkActivity({ talkId, talkTitle, date, noSubmission, showTimeline = false }: TalkActivityProps) {
  return (
    <div className="relative pb-8">
      {showTimeline && <ActivityLine />}
      <div className="relative flex items-start space-x-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-500">
          <MicrophoneIcon className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        <div className="flex min-w-0 flex-1 items-start justify-between">
          <div>
            <div className="text-sm text-gray-500">
              <Link to={`talks/${talkId}`} className="font-medium text-gray-900 hover:text-gray-900">
                {talkTitle}
              </Link>{' '}
              updated{' '}
              <span className="whitespace-nowrap">
                <ClientOnly>{() => formatRelative(new Date(date), new Date())}</ClientOnly>
              </span>
            </div>
            <p className="mt-0.5 text-sm text-gray-500">by Clark Kent</p>
            {noSubmission && (
              <IconLabel icon={ExclamationCircleIcon}>Not submitted yet. Search for great event.</IconLabel>
            )}
          </div>
          <div className="flex gap-4 text-sm text-gray-700">
            <Link to={`talks/${talkId}`}>View</Link>
            <Link to={`talks/${talkId}/edit`}>Edit</Link>
            <Link to="/">Submit</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

interface EventActivityProps extends ActivityItemProps {
  eventName: string;
  eventSlug: string;
  date: string;
  status: string;
}

export function EventActivity({ eventName, eventSlug, date, showTimeline = false, status }: EventActivityProps) {
  return (
    <div className="relative pb-4">
      {showTimeline && <ActivityLine />}
      <div className="relative flex items-start space-x-3">
        <div>
          <div className="relative px-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
              {status === 'DRAFT' && <ExclamationCircleIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />}
              {status === 'SUBMITTED' && <PlusIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />}
              {status === 'ACCEPTED' && <CheckIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />}
              {status === 'REJECTED' && <XMarkIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />}
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1 py-1.5">
          <div className="text-sm text-gray-500">
            {status} to{' '}
            <Link to={`/${eventSlug}/proposals`} className="font-medium text-gray-900 hover:text-gray-900">
              {eventName}
            </Link>{' '}
            <span className="whitespace-nowrap">
              <ClientOnly>{() => formatRelative(new Date(date), new Date())}</ClientOnly>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MoreInfo() {
  return (
    <div className="relative pb-4">
      <div className="relative flex items-start space-x-3">
        <div>
          <div className="relative px-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
              <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1 py-1.5">
          <Link className="text-gray-500 underline hover:text-gray-500" to="/">
            View 5 more activities
          </Link>
        </div>
      </div>
    </div>
  );
}
