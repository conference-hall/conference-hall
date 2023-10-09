import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData, useOutletContext } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { eventSocialCard } from '~/libs/meta/social-cards.ts';
import { useUser } from '~/root.tsx';
import { Footer } from '~/routes/__components/Footer.tsx';
import { Navbar } from '~/routes/__components/navbar/Navbar.tsx';
import type { Event } from '~/routes/__server/events/get-event.server.ts';
import { getEvent } from '~/routes/__server/events/get-event.server.ts';

import { EventHeader } from './__components/EventHeader.tsx';
import { EventTabs } from './__components/EventTabs.tsx';

export const meta = mergeMeta<typeof loader>(
  ({ data }) => (data ? [{ title: `${data.name} | Conference Hall` }] : []),
  ({ data }) => (data ? eventSocialCard({ name: data.name, slug: data.slug, logo: data.logo }) : []),
);

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.event, 'Invalid event slug');

  const event = await getEvent(params.event);
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

export function useEvent() {
  return useOutletContext<{ event: Event }>();
}
