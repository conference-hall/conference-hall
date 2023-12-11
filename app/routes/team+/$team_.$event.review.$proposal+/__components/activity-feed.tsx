import { HeartIcon, StarIcon } from '@heroicons/react/20/solid';
import { cx } from 'class-variance-authority';
import { formatDistanceToNowStrict } from 'date-fns';

import { Avatar } from '~/design-system/Avatar';
import { Button } from '~/design-system/Buttons';
import type { Feed } from '~/domains/proposal-reviews/ActivityFeed';
import { ClientOnly } from '~/routes/__components/utils/ClientOnly';

export function ActivityFeed({ activity }: { activity: Feed }) {
  return (
    <div className="pl-4 md:pr-32 pt-4 pb-8">
      <ul className="space-y-4">
        {activity.map((item, itemIdx) => (
          <li key={item.id} className="relative flex gap-x-4">
            <div
              className={cx(
                itemIdx === activity.length - 1 ? 'h-8' : '-bottom-8',
                'absolute left-0 -top-8 flex w-6 justify-center',
              )}
            >
              <div className="w-px bg-gray-300" />
            </div>
            {item.type === 'comment' ? (
              <>
                <Avatar picture={item.picture} name={item.user} size="xs" className="relative mt-3 flex-none" />
                <div className="flex-auto rounded-md p-3 ring-1 ring-inset ring-gray-200 bg-white">
                  <div className="flex justify-between gap-x-4">
                    <div className="py-0.5 text-xs leading-5 text-gray-500">
                      <span className="font-medium text-gray-900">{item.user}</span> commented
                    </div>
                    <time dateTime={item.timestamp} className="flex-none py-0.5 text-xs leading-5 text-gray-500">
                      <ClientOnly>{() => `${formatDistanceToNowStrict(new Date(item.timestamp))} ago`}</ClientOnly>
                    </time>
                  </div>
                  <p className="text-sm leading-6 text-gray-500">{item.comment}</p>
                </div>
              </>
            ) : (
              <>
                {item.feeling === 'POSITIVE' ? (
                  <div className="relative flex h-6 w-6 flex-none items-center justify-center rounded-full bg-red-400 z-10">
                    <HeartIcon className="h-4 w-4 text-white" aria-hidden="true" />
                  </div>
                ) : (
                  <div className="relative flex h-6 w-6 flex-none items-center justify-center rounded-full bg-yellow-500 z-10">
                    <StarIcon className="h-4 w-4 mb-0.5 text-white" aria-hidden="true" />
                  </div>
                )}
                <p className="flex-auto py-0.5 text-xs leading-5 text-gray-500">
                  <span className="font-medium text-gray-900">{item.user}</span> {item.type} the proposal with{' '}
                  <strong>{item.note} stars.</strong>
                </p>
                <time dateTime={item.timestamp} className="flex-none py-0.5 pr-3 text-xs leading-5 text-gray-500">
                  <ClientOnly>{() => `${formatDistanceToNowStrict(new Date(item.timestamp))} ago`}</ClientOnly>
                </time>
              </>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex gap-x-3">
        <Avatar
          picture="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
          size="xs"
        />
        <form action="#" className="relative flex-auto">
          <div className="overflow-hidden bg-white rounded-lg pb-12 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
            <label htmlFor="comment" className="sr-only">
              Add your comment
            </label>
            <textarea
              rows={2}
              name="comment"
              id="comment"
              className="block w-full resize-none border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
              placeholder="Add your comment..."
              defaultValue={''}
            />
          </div>

          <div className="absolute inset-x-0 bottom-0 flex justify-end py-2 pl-3 pr-2">
            <Button variant="secondary">Comment</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
