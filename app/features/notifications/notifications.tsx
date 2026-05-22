import { BellSlashIcon, ChatBubbleLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { Trans, useTranslation } from 'react-i18next';
import { Form, href, redirect } from 'react-router';
import { Footer } from '~/app-platform/components/footer.tsx';
import { NavbarSpeaker } from '~/app-platform/components/navbar/navbar-speaker.tsx';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { Button } from '~/design-system/button.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { RequireAuthContext, requireAuth } from '~/shared/authentication/auth.middleware.ts';
import type { Route } from './+types/notifications.ts';
import { Notifications } from './services/notifications.server.ts';

export const middleware = [requireAuth];

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Notifications | Conference Hall' }]);
};

export const loader = async ({ context }: Route.LoaderArgs) => {
  const authUser = context.get(RequireAuthContext);
  return Notifications.for(authUser.id).list();
};

export const action = async ({ request, context }: Route.ActionArgs) => {
  const authUser = context.get(RequireAuthContext);
  const form = await request.formData();
  const intent = form.get('intent') as string;

  switch (intent) {
    case 'mark-as-read': {
      const notificationId = form.get('notificationId') as string;
      const redirectTo = form.get('redirectTo') as string;
      await Notifications.for(authUser.id).markAsRead(notificationId);
      return redirect(redirectTo);
    }
    case 'mark-all-as-read': {
      await Notifications.for(authUser.id).markAllAsRead();
      return { success: true };
    }
  }
  return null;
};

const NOTIFICATION_CONFIG = {
  PROPOSAL_ACCEPTED: {
    icon: CheckCircleIcon,
    emoji: '🎉',
    i18nKey: 'notifications.item.accepted',
  },
  PROPOSAL_REJECTED: {
    icon: XCircleIcon,
    emoji: '😔',
    i18nKey: 'notifications.item.rejected',
  },
  PROPOSAL_MESSAGE_RECEIVED: {
    icon: ChatBubbleLeftIcon,
    emoji: '💬',
    i18nKey: 'notifications.item.message',
  },
} as const;

function getNotificationLink(notification: { type: string; event: { slug: string }; proposal: { id: string } }) {
  return href('/:event/proposals/:proposal', {
    event: notification.event.slug,
    proposal: notification.proposal.id,
  });
}

export default function NotificationsRoute({ loaderData: notifications }: Route.ComponentProps) {
  const { t } = useTranslation();
  const hasNotifications = notifications.length > 0;
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <>
      <NavbarSpeaker />

      <Page>
        <Page.Heading title={t('notifications.heading')} subtitle={t('notifications.description')}>
          {hasUnread && (
            <Form method="post">
              <Button type="submit" name="intent" value="mark-all-as-read" variant="secondary">
                {t('notifications.mark-all-read')}
              </Button>
            </Form>
          )}
        </Page.Heading>

        {hasNotifications ? (
          <ul aria-label={t('notifications.list')} className="space-y-4">
            {notifications.map((notification) => {
              const config = NOTIFICATION_CONFIG[notification.type];
              const link = getNotificationLink(notification);

              return (
                <Card
                  key={notification.id}
                  as="li"
                  p={4}
                  className={cx(!notification.read && 'ring-2 ring-indigo-500')}
                >
                  <Form method="post">
                    <input type="hidden" name="notificationId" value={notification.id} />
                    <input type="hidden" name="redirectTo" value={link} />
                    <button type="submit" name="intent" value="mark-as-read" className="flex w-full text-left">
                      <div className="mt-1 flex h-6 w-6 shrink-0">{config.emoji}</div>
                      <div className="ml-4">
                        <H2>
                          <Trans
                            i18nKey={config.i18nKey}
                            values={{ title: notification.proposal.title, eventName: notification.event.name }}
                            components={[<strong key="1" />, <strong key="2" />]}
                          />
                        </H2>
                      </div>
                    </button>
                  </Form>
                </Card>
              );
            })}
          </ul>
        ) : (
          <EmptyState label={t('notifications.empty')} icon={BellSlashIcon} />
        )}
      </Page>

      <Footer />
    </>
  );
}
