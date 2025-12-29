import { BellSlashIcon } from '@heroicons/react/24/outline';
import { Trans, useTranslation } from 'react-i18next';
import { href } from 'react-router';
import { Footer } from '~/app-platform/components/footer.tsx';
import { NavbarSpeaker } from '~/app-platform/components/navbar/navbar-speaker.tsx';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { CardLink } from '~/design-system/layouts/card.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { getRequiredAuthUser, requireAuth } from '~/shared/authentication/auth.middleware.ts';
import type { Route } from './+types/notifications.ts';
import { Notifications } from './services/notifications.server.ts';

export const middleware = [requireAuth];

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Notifications | Conference Hall' }]);
};

export const loader = async ({ context }: Route.LoaderArgs) => {
  const authUser = getRequiredAuthUser(context);
  return Notifications.for(authUser.id).list();
};

export default function OrganizerRoute({ loaderData: notifications }: Route.ComponentProps) {
  const { t } = useTranslation();
  const hasNotifications = Boolean(notifications && notifications.length > 0);

  return (
    <>
      <NavbarSpeaker />

      <Page>
        <Page.Heading title={t('notifications.heading')} subtitle={t('notifications.description')} />

        {hasNotifications ? (
          <ul aria-label={t('notifications.list')} className="space-y-4">
            {notifications.map(({ event, proposal }) => (
              <CardLink
                key={`${event.slug}-${proposal.id}`}
                as="li"
                to={href('/:event/proposals/:proposal', { event: event.slug, proposal: proposal.id })}
                className="flex"
                p={4}
              >
                <div className="mt-1 flex h-6 w-6 shrink-0">🎉</div>
                <div className="ml-4">
                  <H2>
                    <Trans
                      i18nKey="notifications.item.title"
                      values={{ title: proposal.title, eventName: event.name }}
                      components={[<strong key="1" />, <strong key="2" />]}
                    />
                  </H2>
                  <p className="text-gray-500 text-sm">{t('notifications.item.description')}</p>
                </div>
              </CardLink>
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
