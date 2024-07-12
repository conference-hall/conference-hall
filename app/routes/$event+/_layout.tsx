import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData, useMatch } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { EventPage } from '~/.server/event-page/event-page.ts';
import { Avatar } from '~/design-system/avatar.tsx';
import { Container } from '~/design-system/layouts/container.tsx';
import { H1, Text } from '~/design-system/typography.tsx';
import { formatConferenceDates } from '~/libs/formatters/cfp.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { eventSocialCard } from '~/libs/meta/social-cards.ts';
import { Footer } from '~/routes/__components/footer.tsx';
import { Navbar } from '~/routes/__components/navbar/navbar.tsx';
import { useUser } from '~/routes/__components/use-user.tsx';

import { ClientOnly } from '../__components/utils/client-only.tsx';
import { EventTabs } from './__components/event-tabs.tsx';

export const meta = mergeMeta<typeof loader>(
  ({ data }) => (data ? [{ title: `${data.name} | Conference Hall` }] : []),
  ({ data }) => (data ? eventSocialCard({ name: data.name, slug: data.slug, logo: data.logo }) : []),
);

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.event, 'Invalid event slug');

  const event = await EventPage.of(params.event).get();
  return json(event);
};

export default function EventRoute() {
  const { user } = useUser();
  const event = useLoaderData<typeof loader>();

  const submissionRoute = useMatch('/:event/submission/*');

  return (
    <>
      <Navbar user={user} withSearch />

      <header className="bg-gray-800">
        <Container className="h-24 flex flex-row items-center justify-between">
          <div className="flex gap-6 items-end relative">
            <Avatar
              picture={event.logo}
              name={event.name}
              size="4xl"
              square
              ring
              ringColor="white"
              className="hidden sm:block absolute -bottom-16"
            />
            <Avatar
              picture={event.logo}
              name={event.name}
              size="xl"
              square
              ring
              ringColor="white"
              className="sm:hidden"
            />
            <div className="sm:ml-40 p-2">
              <H1 size="2xl" variant="light">
                {event.name}
              </H1>
              <Text variant="secondary-light" weight="medium">{`by ${event.teamName}`}</Text>
            </div>
          </div>

          <div className="hidden md:flex md:flex-col md:items-end md:gap-1 truncate">
            <Text variant="light" size="base" weight="semibold" truncate>
              <ClientOnly>
                {() => formatConferenceDates(event.type, event.timezone, event.conferenceStart, event.conferenceEnd)}
              </ClientOnly>
            </Text>
            {event.address && (
              <Text variant="secondary-light" size="xs" truncate>
                {event.address}
              </Text>
            )}
          </div>
        </Container>
      </header>

      {!submissionRoute ? (
        <EventTabs
          slug={event.slug}
          type={event.type}
          surveyEnabled={event.surveyEnabled}
          isAuthenticated={Boolean(user)}
          className="sm:ml-40"
        />
      ) : null}

      <Outlet context={{ user, event }} />

      <Footer />
    </>
  );
}
