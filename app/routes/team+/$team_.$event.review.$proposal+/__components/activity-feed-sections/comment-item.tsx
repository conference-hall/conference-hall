import { Form } from '@remix-run/react';
import { formatDistanceToNowStrict } from 'date-fns';

import { Avatar } from '~/design-system/Avatar';
import type { FeedItem } from '~/domains/proposal-reviews/ActivityFeed';
import { useUser } from '~/root';
import { ClientOnly } from '~/routes/__components/utils/ClientOnly';

export function CommentItem({ item }: { item: FeedItem }) {
  const { user } = useUser();

  if (item.type !== 'comment') return null;

  return (
    <>
      <Avatar picture={item.picture} name={item.user} size="xs" className="relative mt-3 flex-none" />
      <div className="flex-auto rounded-md p-3 ring-1 ring-inset ring-gray-200 bg-white">
        <div className="flex justify-between gap-x-4">
          <div className="py-0.5 text-xs leading-5 text-gray-500">
            <span className="font-medium text-gray-900">{item.user}</span> commented
            {user?.id === item.userId && (
              <>
                <span>&nbsp;&bull;&nbsp;</span>
                <Form method="POST" className="inline-block">
                  <input type="hidden" name="intent" value="delete-comment" />
                  <input type="hidden" name="commentId" value={item.id} />
                  <button type="submit" className="hover:underline">
                    delete
                  </button>
                </Form>
              </>
            )}
          </div>
          <time dateTime={item.timestamp} className="flex-none py-0.5 text-xs leading-5 text-gray-500">
            <ClientOnly>{() => `${formatDistanceToNowStrict(new Date(item.timestamp))} ago`}</ClientOnly>
          </time>
        </div>
        <p className="text-sm leading-6 text-gray-500">{item.comment}</p>
      </div>
    </>
  );
}
