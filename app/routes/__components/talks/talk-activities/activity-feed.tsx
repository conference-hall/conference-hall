import { cx } from 'class-variance-authority';

import { TalkSubmittedItem } from './talk-submitted-item';

type Props = { activity: Array<string> };

export function ActivityFeed({ activity }: Props) {
  return (
    <>
      {activity.length > 0 && (
        <ul aria-label="Activity feed" className="space-y-4">
          {activity.map((item, index) => (
            <li key={item} className="relative flex gap-x-4">
              <FeedLine last={index === activity.length - 1} />
              <TalkSubmittedItem
                item={{
                  user: 'Benjamin',
                  event: { name: 'Devfest Nantes', slug: 'devfest-nantes' },
                  type: 'status',
                  timestamp: '2024-06-01',
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function FeedLine({ last }: { last: boolean }) {
  return (
    <div className={cx(last ? 'h-12' : '-bottom-8', 'absolute left-0 -top-8 flex w-6 justify-center')}>
      <div className="w-px bg-gray-300" />
    </div>
  );
}
