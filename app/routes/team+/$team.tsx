import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData, useMatch, useRouteLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { UserTeam } from '~/.server/team/user-team.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { useUser } from '~/routes/__components/use-user.tsx';

import { Navbar } from '../__components/navbar/navbar.tsx';
import type { loader as routeEventLoader } from './$team.$event+/_layout';
import { useScheduleFullscreen } from './$team.$event+/schedule+/__components/header/use-schedule-fullscreen.tsx';
import { EventTabs } from './$team+/__components/event-tabs.tsx';
import { TeamTabs } from './$team+/__components/team-tabs.tsx';

export const meta = mergeMeta<typeof loader>(({ data }) => (data ? [{ title: `${data.name} | Conference Hall` }] : []));

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');

  const team = await UserTeam.for(userId, params.team).get();
  return json(team);
};

export default function TeamLayout() {
  const { user } = useUser();
  const team = useLoaderData<typeof loader>();
  const event = useRouteLoaderData<typeof routeEventLoader>('routes/team+/$team.$event+/_layout');

  const { isFullscreen } = useScheduleFullscreen();
  const isEventCreationRoute = Boolean(useMatch('/team/:team/new/*'));

  if (isFullscreen || isEventCreationRoute) return <Outlet context={{ user, team }} />;

  return (
    <>
      <Navbar layout="team" user={user} />

      {event ? (
        <EventTabs
          teamSlug={team.slug}
          eventSlug={event.slug}
          eventType={event.type}
          permissions={team.userPermissions}
        />
      ) : (
        <TeamTabs slug={team.slug} permissions={team.userPermissions} />
      )}

      <Outlet context={{ user, team }} />
    </>
  );
}
