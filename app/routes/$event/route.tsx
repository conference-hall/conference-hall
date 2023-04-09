import invariant from 'tiny-invariant';
import type { LoaderArgs } from '@remix-run/node';
import type { UserContext } from '~/root';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData, useOutletContext } from '@remix-run/react';
import { Navbar } from '~/shared-components/navbar/Navbar';
import { mapErrorToResponse } from '~/libs/errors';
import { getEvent } from '~/shared-server/events/get-event.server';
import { EventHeader } from './components/EventHeader';
import { EventTabs } from './components/EventTabs';
import { Footer } from '~/shared-components/Footer';
import { NavLink } from '~/shared-components/navbar/NavLink';

export const loader = async ({ params }: LoaderArgs) => {
  invariant(params.event, 'Invalid event slug');

  try {
    const event = await getEvent(params.event);
    return json(event);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export default function EventRoute() {
  const event = useLoaderData<typeof loader>();
  const { user, notifications } = useOutletContext<UserContext>();
  const hasOrganization = Boolean(user?.organizationsCount);

  return (
    <>
      <Navbar user={user} notifications={notifications} withSearch>
        <NavLink to="/speaker" end>
          Activity
        </NavLink>
        <NavLink to="/speaker/talks">Talks</NavLink>
        <NavLink to="/speaker/profile">Profile</NavLink>
        {hasOrganization && <NavLink to="/organizer">Organizations</NavLink>}
      </Navbar>

      <EventHeader
        type={event.type}
        name={event.name}
        slug={event.slug}
        bannerUrl={event.bannerUrl}
        address={event.address}
        conferenceStart={event.conferenceStart}
        conferenceEnd={event.conferenceEnd}
      />

      <EventTabs slug={event.slug} type={event.type} surveyEnabled={event.surveyEnabled} />

      <Outlet context={event} />

      <Footer />
    </>
  );
}

export function useEvent() {
  return useOutletContext<Awaited<ReturnType<typeof getEvent>>>();
}
