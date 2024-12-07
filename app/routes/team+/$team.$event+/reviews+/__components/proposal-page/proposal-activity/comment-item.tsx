import { formatDistanceToNowStrict } from 'date-fns';
import { Form } from 'react-router';

import type { FeedItem } from '~/.server/reviews/activity-feed.ts';
import { Avatar } from '~/design-system/avatar.tsx';
import { useUser } from '~/routes/__components/contexts/user-context.tsx';
import { CommentReactions } from './comment-reactions.tsx';

export function CommentItem({ item }: { item: FeedItem }) {
  const user = useUser();

  if (item.type !== 'comment') return null;

  return (
    <>
      <Avatar picture={item.picture} name={item.user} size="xs" className="relative mt-3 flex-none" />

      <div className="w-full rounded-md p-3 ring-1 ring-inset ring-gray-200 bg-white min-w-0">
        <div className="flex justify-between gap-x-4">
          <div className="py-0.5 text-xs leading-5 text-gray-500">
            <span className="font-medium text-gray-900">{item.user}</span> commented
            {user?.id === item.userId && (
              <>
                <span>&nbsp;&bull;&nbsp;</span>
                <Form method="POST" className="inline-block">
                  <input type="hidden" name="commentId" value={item.id} />
                  <button type="submit" name="intent" value="delete-comment" className="font-medium hover:underline">
                    delete
                  </button>
                </Form>
              </>
            )}
          </div>
          <time dateTime={item.timestamp.toISOString()} className="flex-none py-0.5 text-xs leading-5 text-gray-500">
            {formatDistanceToNowStrict(item.timestamp)} ago
          </time>
        </div>

        <p className="text-sm leading-6 text-gray-700 whitespace-pre-line break-words">{item.comment}</p>

        <CommentReactions commentId={item.id} reactions={item.reactions} />
      </div>
    </>
  );
}
