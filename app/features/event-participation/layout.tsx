import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { href, Outlet, useMatch } from 'react-router';
import { Footer } from '~/app-platform/components/footer.tsx';
import { NavbarEvent } from '~/app-platform/components/navbar/navbar-event.tsx';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { eventSocialCard } from '~/app-platform/seo/utils/social-cards.ts';
import { Avatar } from '~/design-system/avatar.tsx';
import { BG_COLOR } from '~/design-system/colors.ts';
import { Container } from '~/design-system/layouts/container.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { NavTab, NavTabs } from '~/design-system/navigation/nav-tabs.tsx';
import { H1, Text } from '~/design-system/typography.tsx';
import { EventPage } from '~/features/event-participation/event-page/services/event-page.server.ts';
import { useUser } from '../../app-platform/components/user-context.tsx';
import type { Route } from './+types/layout.ts';
import { CurrentEventPageProvider } from './event-page-context.tsx';

export const meta = (args: Route.MetaArgs) => {
  const { data, matches } = args;
  return mergeMeta(matches, [
    { title: `${data?.name} | Conference Hall` },
    { name: 'description', content: `Submit your proposal to ${data?.name} call for papers.` },
    ...(data ? eventSocialCard({ name: data.name, slug: data.slug, logoUrl: data.logoUrl }) : []),
  ]);
};

export const loader = async ({ params }: Route.LoaderArgs) => {
  const event = await EventPage.of(params.event).get();
  return event;
};

export default function EventRoute({ loaderData: event }: Route.ComponentProps) {
  const { t } = useTranslation();
  const user = useUser();
  const isEventRoute = useMatch({ path: '/:event', end: true });
  const isSubmissionRoute = useMatch('/:event/submission/*');
  const isAuthenticated = Boolean(user);

  return (
    <>
      <NavbarEvent />

      <header className={cx(BG_COLOR, 'hidden lg:block')}>
        <Container className="flex flex-row gap-6 pt-2 pb-6 items-center relative">
          <Avatar
            picture={event.logoUrl}
            name={event.name}
            size="xl"
            square
            ring
            ringColor="white"
            className="hidden sm:flex"
          />
          <div>
            <H1 size="2xl" variant="light" truncate>
              {event.name}
            </H1>
            <Text variant="secondary-light" weight="medium">
              {t('common.by', { names: [event.teamName], interpolation: { escapeValue: false } })}
            </Text>
          </div>
        </Container>
      </header>

      {!isSubmissionRoute && isAuthenticated ? (
        <Page.NavHeader
          className={cx('flex pb-0 flex-row items-center space-between', {
            'hidden lg:flex ': !isEventRoute,
          })}
        >
          <NavTabs py={4} scrollable className="grow">
            <NavTab to={href('/:event', { event: event.slug })} end className="hidden lg:flex">
              {t(`common.event.type.label.${event.type}`)}
            </NavTab>

            {isAuthenticated ? (
              <NavTab to={href('/:event/proposals', { event: event.slug })}>{t('event.nav.proposals')}</NavTab>
            ) : null}

            {isAuthenticated && event.hasSurvey ? (
              <NavTab to={href('/:event/survey', { event: event.slug })}>{t('event.nav.survey')}</NavTab>
            ) : null}
          </NavTabs>
        </Page.NavHeader>
      ) : null}

      <CurrentEventPageProvider event={event}>
        <Outlet />
      </CurrentEventPageProvider>

      <Footer />
    </>
  );
}
