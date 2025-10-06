import { Trans, useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { useUser } from '~/app-platform/components/user-context.tsx';
import { ActivityFeed } from '~/design-system/activity-feed/activity-feed.tsx';
import { Avatar } from '~/design-system/avatar.tsx';
import { ClientOnly } from '~/design-system/utils/client-only.tsx';
import type { FeedItem } from '~/features/event-management/proposals/services/activity-feed.server.ts';
import { formatDistance } from '~/shared/datetimes/datetimes.ts';
import { CommentReactions } from './comment-reactions.tsx';

// todo(conversation): FeedItem type should be shared (not on server)
export function CommentEntry({ item }: { item: FeedItem }) {
  const { t, i18n } = useTranslation();
  const user = useUser();

  if (item.type !== 'comment') return null;

  return (
    <ActivityFeed.Entry marker={<Avatar picture={item.picture} name={item.user} />} withLine>
      <div className="w-full rounded-md p-3 ring-1 ring-inset ring-gray-200 bg-white min-w-0 space-y-2">
        <div className="flex justify-between gap-x-4">
          <div className="text-xs text-gray-500">
            <Trans
              i18nKey="event-management.proposal-page.activity-feed.commented"
              values={{ name: item.user }}
              components={[<span key="1" className="font-medium text-gray-900" />]}
            />
            {user?.id === item.userId && (
              <>
                <span>&nbsp;&bull;&nbsp;</span>
                <Form method="POST" className="inline-block">
                  <input type="hidden" name="commentId" value={item.id} />
                  <button
                    type="submit"
                    name="intent"
                    value="delete-comment"
                    className="font-medium hover:underline cursor-pointer"
                  >
                    {t('common.delete')}
                  </button>
                </Form>
              </>
            )}
          </div>
          <ClientOnly>
            {() => (
              <time dateTime={item.timestamp.toISOString()} className="flex-none text-xs text-gray-500">
                {formatDistance(item.timestamp, i18n.language)}
              </time>
            )}
          </ClientOnly>
        </div>

        <p className="text-sm leading-6 text-gray-700 whitespace-pre-line break-words">{item.comment}</p>

        <CommentReactions commentId={item.id} reactions={item.reactions} />
      </div>
    </ActivityFeed.Entry>
  );
}
