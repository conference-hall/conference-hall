import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { EventPage } from '~/.server/event-page/event-page.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { eventSocialCard } from '~/libs/meta/social-cards.ts';
import { Footer } from '~/routes/__components/footer.tsx';
import { Navbar } from '~/routes/__components/navbar/navbar.tsx';
import { useUser } from '~/routes/__components/use-user.tsx';

import { EventHeader } from './__components/event-header.tsx';
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

  return (
    <>
      <Navbar user={user} withSearch />

      <EventHeader
        name={event.name}
        type={event.type}
        teamName={event.teamName}
        logo={event.logo}
        address={event.address}
        conferenceStart={event.conferenceStart}
        conferenceEnd={event.conferenceEnd}
      />

      <EventTabs slug={event.slug} type={event.type} surveyEnabled={event.surveyEnabled} />

      <Outlet context={{ user, event }} />

      <Footer />
    </>
  );
}
