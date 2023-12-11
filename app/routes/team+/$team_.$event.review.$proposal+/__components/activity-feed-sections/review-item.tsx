import { HeartIcon, StarIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { formatDistanceToNowStrict } from 'date-fns';

import type { FeedItem } from '~/domains/proposal-reviews/ActivityFeed';
import { ClientOnly } from '~/routes/__components/utils/ClientOnly';

export function ReviewItem({ item }: { item: FeedItem }) {
  if (item.type !== 'review') return null;

  return (
    <>
      {item.feeling === 'NEUTRAL' && (
        <div className="relative flex h-6 w-6 flex-none items-center justify-center rounded-full bg-yellow-500 z-10">
          <StarIcon className="h-4 w-4 mb-0.5 text-white" aria-hidden="true" />
        </div>
      )}
      {item.feeling === 'POSITIVE' && (
        <div className="relative flex h-6 w-6 flex-none items-center justify-center rounded-full bg-red-400 z-10">
          <HeartIcon className="h-4 w-4 text-white" aria-hidden="true" />
        </div>
      )}
      {item.feeling === 'NEGATIVE' && (
        <div className="relative flex h-6 w-6 flex-none items-center justify-center rounded-full bg-gray-700 z-10">
          <XMarkIcon className="h-4 w-4 text-white" aria-hidden="true" />
        </div>
      )}
      <p className="flex-auto py-0.5 text-xs leading-5 text-gray-500">
        <span className="font-medium text-gray-900">{item.user}</span> reviewed the proposal with{' '}
        <strong>{item.note} stars.</strong>
      </p>
      <time dateTime={item.timestamp} className="flex-none py-0.5 pr-3 text-xs leading-5 text-gray-500">
        <ClientOnly>{() => `${formatDistanceToNowStrict(new Date(item.timestamp))} ago`}</ClientOnly>
      </time>
    </>
  );
}
