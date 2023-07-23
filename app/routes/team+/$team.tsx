import { parse } from '@conform-to/zod';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Outlet, useLoaderData, useOutletContext, useRouteLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Container } from '~/design-system/layouts/Container';
import { PageHeader } from '~/design-system/layouts/PageHeader';
import { requireSession } from '~/libs/auth/session';
import { mergeMeta } from '~/libs/meta/merge-meta';
import { useUser } from '~/root';
import TeamBreadcrumb from '~/routes/__components/teams/TeamBreadcrumb';

import type { OrganizerEvent } from '../team.$team.$event+/__server/get-event.server';
import { EventTabs } from './__components/EventTabs';
import { TeamTabs } from './__components/TeamTabs';
import { createEvent } from './__server/create-event.server';
import type { Team } from './__server/get-team.server';
import { getTeam } from './__server/get-team.server';
import { EventCreateSchema } from './__types/event-create.schema';

export const meta = mergeMeta<typeof loader>(({ data }) => (data ? [{ title: `${data.name} | Conference Hall` }] : []));

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');

  const team = await getTeam(params.team, userId);
  return json(team);
};

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  const form = await request.formData();

  const result = parse(form, { schema: EventCreateSchema });
  if (!result.value) return json(result.error);

  const event = await createEvent(params.team, userId, result.value);
  if (event.error) return json(event.error?.fieldErrors);

  return redirect(`/team/${params.team}/${event.slug}/settings`);
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
