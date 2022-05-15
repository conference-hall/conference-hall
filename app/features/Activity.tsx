import { MicrophoneIcon, PlusIcon, XIcon, CheckIcon } from '@heroicons/react/solid';
import { ExclamationIcon, DotsHorizontalIcon } from '@heroicons/react/outline';
import { IconLabel } from '../components/IconLabel';
import { Link } from '../components/Links';

const activity = [
  {
    id: 1,
    name: 'Le Web et la Typographie',
    date: '6d ago',
    hasMore: true,
    steps: [
      {
        id: 2,
        action: 'Submitted',
        name: 'Technosaure 2022 #3',
        date: '2d ago',
      },
      {
        id: 3,
        action: 'Accepted',
        name: 'DevFest Nantes',
        date: '5d ago',
      },
    ],
  },
  {
    id: 5,
    name: 'GitHub Actions: Automatisez vous la vie',
    date: '6d ago',
  },
  {
    id: 6,
    name: 'Build the perfect CFP for your Community',
    date: '6d ago',
    steps: [
      {
        id: 2,
        action: 'Rejected',
        name: 'Microsoft tech summit',
        date: '2d ago',
      },
    ],
  },
];

export function Activity() {
  return (
    <div>
      {activity.map((item) => (
        <ul key={item.id} role="list" className="p-4 rounded-lg hover:bg-gray-50 ">
          <li key={item.id}>
            <TalkActivity
              name={item.name}
              date={item.date}
              noSubmission={!item.steps}
              showTimeline={item.steps ? item.steps.length > 0 : false}
            />
          </li>
          {item.steps?.map((step, index2) => (
            <li key={step.id}>
              <EventActivity
                key={step.id}
                name={step.name}
                date={step.date}
                action={step.action}
                showTimeline={index2 < item.steps.length - 1 || !!item.hasMore}
              />
            </li>
          ))}
          {item.hasMore && (
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
  showTimeline: boolean;
}

function ActivityLine() {
  return <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />;
}

interface TalkActivityProps extends ActivityItemProps {
  date: string;
  name: string;
  noSubmission: boolean;
}

function TalkActivity({ name, date, noSubmission, showTimeline }: TalkActivityProps) {
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
              <a href="#" className="font-medium text-gray-900">
                {name}
              </a>{' '}
              updated <span className="whitespace-nowrap">{date}</span>
            </div>
            <p className="mt-0.5 text-sm text-gray-500">by Clark Kent</p>
            {noSubmission && (
              <IconLabel icon={ExclamationIcon} className="mt-2 text-sm text-yellow-600">
                Not submitted yet. Search for great event.
              </IconLabel>
            )}
          </div>
          <div className="text-sm text-gray-700 flex gap-4">
            <Link to="/">View</Link>
            <Link to="/">Edit</Link>
            <Link to="/">Submit</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

interface EventActivityProps extends ActivityItemProps {
  name: string;
  date: string;
  action: string;
}

function EventActivity({ name, date, showTimeline, action }: EventActivityProps) {
  return (
    <div className="relative pb-4">
      {showTimeline && <ActivityLine />}
      <div className="relative flex items-start space-x-3">
        <div>
          <div className="relative px-1">
            <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
              {action === 'Submitted' && <PlusIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />}
              {action === 'Accepted' && <CheckIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />}
              {action === 'Rejected' && <XIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />}
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1 py-1.5">
          <div className="text-sm text-gray-500">
            {action} at{' '}
            <a href="/" className="font-medium text-gray-900">
              {name}
            </a>{' '}
            <span className="whitespace-nowrap">{date}</span>
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
            <Link className="underline text-gray-500 hover:text-gray-500" to="/">View 5 more activities</Link>
        </div>
      </div>
    </div>
  );
}
