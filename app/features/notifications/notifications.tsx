import {
  BellSlashIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  HandThumbUpIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { data, href, useFetcher } from 'react-router';
import { Footer } from '~/app-platform/components/footer.tsx';
import { NavbarSpeaker } from '~/app-platform/components/navbar/navbar-speaker.tsx';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { Button } from '~/design-system/button.tsx';
import { CardLink } from '~/design-system/layouts/card.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { RequireAuthContext, requireAuth } from '~/shared/authentication/auth.middleware.ts';
import type { Route } from './+types/notifications.ts';
import type { NotificationItem } from './services/notifications.server.ts';
import { Notifications } from './services/notifications.server.ts';

export const middleware = [requireAuth];

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Notifications | Conference Hall' }]);
};

export const loader = async ({ context }: Route.LoaderArgs) => {
  const authUser = context.get(RequireAuthContext);
  const notifications = await Notifications.for(authUser.id).list();
  return { notifications };
};

export const action = async ({ request, context }: Route.ActionArgs) => {
  const authUser = context.get(RequireAuthContext);
  const form = await request.formData();
  const intent = form.get('_intent');

  if (intent === 'mark-read') {
    const notificationId = form.get('notificationId') as string;
    await Notifications.for(authUser.id).markRead(notificationId);
  }

  if (intent === 'mark-all-read') {
    await Notifications.for(authUser.id).markAllRead();
  }

  return data(null);
};

const NOTIFICATION_ICONS: Record<string, typeof EnvelopeIcon> = {
  PROPOSAL_SUBMITTED: EnvelopeIcon,
  PROPOSAL_ACCEPTED: HandThumbUpIcon,
  PROPOSAL_REJECTED: XCircleIcon,
};

const NOTIFICATION_I18N = {
  PROPOSAL_SUBMITTED: {
    title: 'notifications.type.proposal-submitted.title',
    description: 'notifications.type.proposal-submitted.description',
  },
  PROPOSAL_ACCEPTED: {
    title: 'notifications.type.proposal-accepted.title',
    description: 'notifications.type.proposal-accepted.description',
  },
  PROPOSAL_REJECTED: {
    title: 'notifications.type.proposal-rejected.title',
    description: 'notifications.type.proposal-rejected.description',
  },
} as const;

export default function NotificationsRoute({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { notifications } = loaderData;
  const hasNotifications = notifications.length > 0;
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <>
      <NavbarSpeaker />

      <Page>
        <div className="flex items-center justify-between">
          <Page.Heading title={t('notifications.heading')} subtitle={t('notifications.description')} />
          {hasUnread && <MarkAllReadButton />}
        </div>

        {hasNotifications ? (
          <ul aria-label={t('notifications.list')} className="space-y-4">
            {notifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </ul>
        ) : (
          <EmptyState label={t('notifications.empty')} icon={BellSlashIcon} />
        )}
      </Page>

      <Footer />
    </>
  );
}

function MarkAllReadButton() {
  const { t } = useTranslation();
  const fetcher = useFetcher();

  return (
    <fetcher.Form method="POST">
      <input type="hidden" name="_intent" value="mark-all-read" />
      <Button type="submit" variant="secondary" iconLeft={CheckCircleIcon}>
        {t('notifications.mark-all-read')}
      </Button>
    </fetcher.Form>
  );
}

function NotificationCard({ notification }: { notification: NotificationItem }) {
  const { t } = useTranslation();
  const fetcher = useFetcher();
  const { type, data: notifData, read, id } = notification;
  const Icon = NOTIFICATION_ICONS[type] ?? EnvelopeIcon;
  const i18n = NOTIFICATION_I18N[type];

  const handleClick = () => {
    if (!read) {
      fetcher.submit({ _intent: 'mark-read', notificationId: id }, { method: 'POST' });
    }
  };

  return (
    <CardLink
      as="li"
      to={href('/:event/proposals/:proposal', { event: notifData.eventSlug, proposal: notifData.proposalId })}
      className={cx('flex', !read && 'border-l-4 border-l-indigo-500')}
      p={4}
      onClick={handleClick}
    >
      <div className="mt-1 flex h-6 w-6 shrink-0">
        <Icon className={cx('h-6 w-6', read ? 'text-gray-400' : 'text-indigo-600')} />
      </div>
      <div className="ml-4">
        <H2 className={cx(read && 'text-gray-500')}>
          {t(i18n.title, { title: notifData.proposalTitle, eventName: notifData.eventName })}
        </H2>
        <p className={cx('text-sm', read ? 'text-gray-400' : 'text-gray-500')}>{t(i18n.description)}</p>
      </div>
    </CardLink>
  );
}
