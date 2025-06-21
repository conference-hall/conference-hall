import { useTranslation } from 'react-i18next';
import { Outlet, useMatch } from 'react-router';
import { EventPage } from '~/.server/event-page/event-page.ts';
import { Avatar } from '~/design-system/avatar.tsx';
import { BG_GRADIENT_COLOR } from '~/design-system/colors.ts';
import { Container } from '~/design-system/layouts/container.tsx';
import { H1, Text } from '~/design-system/typography.tsx';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { eventSocialCard } from '~/libs/meta/social-cards.ts';
import { Footer } from '~/routes/components/footer.tsx';
import { Navbar } from '~/routes/components/navbar/navbar.tsx';
import { CurrentEventPageProvider } from '../components/contexts/event-page-context.tsx';
import { useUser } from '../components/contexts/user-context.tsx';
import type { Route } from './+types/_layout.ts';
import { EventTabs } from './components/event-page/event-tabs.tsx';

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
        <EventTabs
          slug={event.slug}
          type={event.type}
          cfpState={event.cfpState}
          hasSurvey={event.hasSurvey}
          isAuthenticated={Boolean(user)}
          className="sm:ml-40"
        />
      ) : null}

      <CurrentEventPageProvider event={event}>
        <Outlet />
      </CurrentEventPageProvider>

      <Footer />
    </>
  );
}
