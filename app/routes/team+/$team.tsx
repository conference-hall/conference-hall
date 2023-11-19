import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData, useOutletContext, useRouteLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Container } from '~/design-system/layouts/Container';
import { PageHeader } from '~/design-system/layouts/PageHeader';
import type { Team } from '~/domains/MyTeam';
import { MyTeam } from '~/domains/MyTeam';
import { requireSession } from '~/libs/auth/session';
import { mergeMeta } from '~/libs/meta/merge-meta';
import { useUser } from '~/root.tsx';
import { Navbar } from '~/routes/__components/navbar/Navbar.tsx';

import TeamBreadcrumb from '../__components/teams/TeamBreadcrumb';
import type { TeamEvent } from './$team.$event+/__server/get-event.server';
import { EventTabs } from './$team+/__components/EventTabs';
import { TeamTabs } from './$team+/__components/TeamTabs';

export const meta = mergeMeta<typeof loader>(({ data }) => (data ? [{ title: `${data.name} | Conference Hall` }] : []));

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');

  const team = await MyTeam.for(userId, params.team).get(); // TODO: should manage errors
  return json(team);
};

export default function TeamLayoutRoutes() {
  const { user } = useUser();
  const team = useLoaderData<typeof loader>();
  const event = useRouteLoaderData('routes/team+/$team.$event+/_layout') as TeamEvent;

  return (
    <>
      <Navbar user={user} withSearch />

      <PageHeader>
        <Container>
          <TeamBreadcrumb team={team} event={event} />
          {event ? (
            <EventTabs teamSlug={team.slug} eventSlug={event.slug} role={team.role} />
          ) : (
            <TeamTabs slug={team.slug} role={team.role} />
          )}
        </Container>
      </PageHeader>

      <Outlet context={{ user, team }} />
    </>
  );
}

export function useTeam() {
  return useOutletContext<{ team: Team }>();
}
