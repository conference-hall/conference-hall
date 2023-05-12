import invariant from 'tiny-invariant';
import type { LoaderArgs } from '@remix-run/node';
import { useUser } from '~/root';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData, useOutletContext } from '@remix-run/react';
import { Navbar } from '~/shared-components/navbar/Navbar';
import type { Event } from '~/shared-server/events/get-event.server';
import { getEvent } from '~/shared-server/events/get-event.server';
import { EventHeader } from './components/EventHeader';
import { EventTabs } from './components/EventTabs';
import { Footer } from '~/shared-components/Footer';
import { mergeMeta } from '~/libs/meta/merge-meta';
import { eventSocialCard } from '~/libs/meta/social-cards';

export const loader = async ({ params }: LoaderArgs) => {
  invariant(params.event, 'Invalid event slug');

  const event = await getEvent(params.event);
  return json(event);
};

export const meta = mergeMeta<typeof loader>(
  ({ data }) => [{ title: `${data.name} | Conference Hall` }],
  ({ data }) => eventSocialCard({ name: data.name, logo: data.logo, websiteUrl: data.websiteUrl })
);

export default function EventRoute() {
  const { user } = useUser();
  const event = useLoaderData<typeof loader>();

  return (
    <>
      <Navbar user={user} withSearch />

      <EventHeader
        name={event.name}
        slug={event.slug}
        type={event.type}
        organizationName={event.organizationName}
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
