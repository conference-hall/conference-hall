import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData, useRouteLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { UserTeam } from '~/.server/team/UserTeam';
import { Container } from '~/design-system/layouts/Container';
import { PageHeader } from '~/design-system/layouts/page-header';
import { requireSession } from '~/libs/auth/session';
import { mergeMeta } from '~/libs/meta/merge-meta';
import { useUser } from '~/routes/__components/use-user';

import { NavbarOrga } from '../__components/navbar/NavbarOrga';
import type { loader as routeEventLoader } from './$team.$event+/_layout';
import { EventTabs } from './$team+/__components/EventTabs';
import { TeamTabs } from './$team+/__components/TeamTabs';

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

  return (
    <>
      <NavbarOrga user={user} />

      <PageHeader>
        <Container>
          {event ? (
            <EventTabs teamSlug={team.slug} eventSlug={event.slug} eventType={event.type} role={team.role} />
          ) : (
            <TeamTabs slug={team.slug} role={team.role} />
          )}
        </Container>
      </PageHeader>

      <Outlet context={{ user, team }} />
    </>
  );
}
