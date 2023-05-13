import invariant from 'tiny-invariant';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { requireSession } from '~/libs/auth/session';
import { Outlet, useLoaderData, useOutletContext, useRouteLoaderData } from '@remix-run/react';
import TeamBreadcrumb from '~/components/teams/TeamBreadcrumb';
import type { Team } from './server/get-team.server';
import { getTeam } from './server/get-team.server';
import { TeamTabs } from './components/TeamTabs';
import { PageHeader } from '~/design-system/layouts/PageHeader';
import { EventTabs } from './components/EventTabs';
import { Container } from '~/design-system/layouts/Container';
import { EventCreateSchema } from './types/event-create.schema';
import { createEvent } from './server/create-event.server';
import { useUser } from '~/root';
import type { OrganizerEvent } from '../team.$team.$event/server/get-event.server';
import { parse } from '@conform-to/zod';

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
  const event = useRouteLoaderData('routes/team.$team.$event') as OrganizerEvent;

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
