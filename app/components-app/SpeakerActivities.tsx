import { formatRelative } from 'date-fns';
import { MicrophoneIcon, PlusIcon, XIcon, CheckIcon } from '@heroicons/react/solid';
import { ExclamationIcon, DotsHorizontalIcon } from '@heroicons/react/outline';
import { IconLabel } from '../components-ui/IconLabel';
import { Link } from '../components-ui/Links';

interface Props {
  activities: Array<{
    id: string;
    title: string;
    date: string;
    speakers: string[];
    proposals: Array<{ eventSlug: string; eventName: string; date: string; status: string }>;
  }>;
}

export function SpeakerActivities({ activities }: Props) {
  const hasMore = activities.length > 3;
  return (
    <div>
      {activities.map((activity) => (
        <ul key={activity.id} role="list" className="p-4 rounded-lg">
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
  return <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />;
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
        <div className="h-10 w-10 bg-gray-500 rounded-full flex items-center justify-center">
          <MicrophoneIcon className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1 flex items-start justify-between">
          <div>
            <div className="text-sm text-gray-500">
              <Link to={`talks/${talkId}`} className="font-medium text-gray-900 hover:text-gray-900">
                {talkTitle}
              </Link>{' '}
              updated <span className="whitespace-nowrap">{formatRelative(new Date(date), new Date())}</span>
            </div>
            <p className="mt-0.5 text-sm text-gray-500">by Clark Kent</p>
            {noSubmission && (
              <IconLabel icon={ExclamationIcon} className="mt-2 text-sm text-yellow-600">
                Not submitted yet. Search for great event.
              </IconLabel>
            )}
          </div>
          <div className="text-sm text-gray-700 flex gap-4">
            <Link to={`talks/${talkId}`}>View</Link>
            <Link to={`talks/${talkId}/edit`}>Edit</Link>
            <Link to={`/search`}>Submit</Link>
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
            <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
              {status === 'DRAFT' && <ExclamationIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />}
              {status === 'SUBMITTED' && <PlusIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />}
              {status === 'ACCEPTED' && <CheckIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />}
              {status === 'REJECTED' && <XIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />}
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1 py-1.5">
          <div className="text-sm text-gray-500">
            {status} to{' '}
            <Link to={`/${eventSlug}/proposals`} className="font-medium text-gray-900 hover:text-gray-900">
              {eventName}
            </Link>{' '}
            <span className="whitespace-nowrap">{formatRelative(new Date(date), new Date())}</span>
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
            <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
              <DotsHorizontalIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1 py-1.5">
          <Link className="underline text-gray-500 hover:text-gray-500" to="/">
            View 5 more activities
          </Link>
        </div>
      </div>
    </div>
  );
}
