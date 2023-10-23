import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData, useOutletContext, useRouteLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Container } from '~/design-system/layouts/Container.tsx';
import { PageHeader } from '~/design-system/layouts/PageHeader.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { useUser } from '~/root.tsx';
import TeamBreadcrumb from '~/routes/__components/teams/TeamBreadcrumb.tsx';

import type { OrganizerEvent } from '../team.$team.$event+/__server/get-event.server.ts';
import { EventTabs } from './__components/EventTabs.tsx';
import { TeamTabs } from './__components/TeamTabs.tsx';
import type { Team } from './__server/get-team.server.ts';
import { getTeam } from './__server/get-team.server.ts';

export const meta = mergeMeta<typeof loader>(({ data }) => (data ? [{ title: `${data.name} | Conference Hall` }] : []));

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');

  const team = await getTeam(params.team, userId);
  return json(team);
};

export default function OrganizationRoute() {
  const { user } = useUser();
  const team = useLoaderData<typeof loader>();
  const event = useRouteLoaderData('routes/team.$team.$event+/_layout') as OrganizerEvent;

  return (
    <>
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
