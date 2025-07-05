import { useTranslation } from 'react-i18next';
import { href, Outlet, useMatch } from 'react-router';
import { EventPage } from '~/.server/event-page/event-page.ts';
import { Footer } from '~/app-platform/components/footer.tsx';
import { Navbar } from '~/app-platform/components/navbar/navbar.tsx';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { eventSocialCard } from '~/libs/meta/social-cards.ts';
import { Avatar } from '~/shared/design-system/avatar.tsx';
import { ButtonLink } from '~/shared/design-system/buttons.tsx';
import { BG_GRADIENT_COLOR } from '~/shared/design-system/colors.ts';
import { Container } from '~/shared/design-system/layouts/container.tsx';
import { Page } from '~/shared/design-system/layouts/page.tsx';
import { NavTab, NavTabs } from '~/shared/design-system/navigation/nav-tabs.tsx';
import { H1, Text } from '~/shared/design-system/typography.tsx';
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
  const isSubmissionRoute = useMatch('/:event/submission/*');
  const isAuthenticated = Boolean(user);

  return (
    <>
      <Navbar />

      <header className={BG_GRADIENT_COLOR}>
        <Container className="h-24 flex flex-row items-center relative">
          <Avatar
            picture={event.logoUrl}
            name={event.name}
            size="4xl"
            square
            ring
            ringColor="white"
            className="hidden sm:flex absolute -bottom-12"
          />
          <Avatar
            picture={event.logoUrl}
            name={event.name}
            size="xl"
            square
            ring
            ringColor="white"
            className="sm:hidden"
          />
          <div className="ml-2 sm:ml-40 p-2 overflow-hidden">
            <H1 size="2xl" variant="light" truncate>
              {event.name}
            </H1>
            <Text variant="secondary-light" weight="medium">
              {t('common.by', { names: [event.teamName], interpolation: { escapeValue: false } })}
            </Text>
          </div>
        </Container>
      </header>

      {!isSubmissionRoute ? (
        <Page.NavHeader className="flex flex-col pb-2 sm:pb-0 sm:flex-row sm:items-center sm:space-between">
          <NavTabs py={4} scrollable className="grow sm:ml-40">
            <NavTab to={href('/:event', { event: event.slug })} end>
              {t(`common.event.type.label.${event.type}`)}
            </NavTab>

            {isAuthenticated ? (
              <NavTab to={href('/:event/proposals', { event: event.slug })}>{t('event.nav.proposals')}</NavTab>
            ) : null}

            {isAuthenticated && event.hasSurvey ? (
              <NavTab to={href('/:event/survey', { event: event.slug })}>{t('event.nav.survey')}</NavTab>
            ) : null}
          </NavTabs>

          {event.cfpState === 'OPENED' && (
            <ButtonLink to={href('/:event/submission', { event: event.slug })}>
              {t('event.nav.submit-proposal')}
            </ButtonLink>
          )}
        </Page.NavHeader>
      ) : null}

      <CurrentEventPageProvider event={event}>
        <Outlet />
      </CurrentEventPageProvider>

      <Footer />
    </>
  );
}
