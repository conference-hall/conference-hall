import invariant from 'tiny-invariant';
import type { LoaderArgs, SerializeFrom } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Container } from '~/design-system/Container';
import { sessionRequired } from '~/libs/auth/auth.server';
import { Outlet, useLoaderData, useRouteLoaderData } from '@remix-run/react';
import { mapErrorToResponse } from '~/libs/errors';
import OrganizationBreadcrumb from '~/shared-components/organizations/OrganizationBreadcrumb';
import { getOrganization } from './server/get-organization.server';
import { OrganizationTabs } from './components/OrganizationTabs';
import { PageHeader } from '~/design-system/PageHeader';
import { EventTabs } from './components/EventTabs';
import type { OrganizerEventRouteData } from '../organizer.$orga.$event/route';

export type OrganizerRouteData = SerializeFrom<typeof loader>;

export type OrganizationContext = { organization: OrganizerRouteData };

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  invariant(params.orga, 'Invalid organization slug');

  try {
    const organization = await getOrganization(params.orga, uid);
    return json(organization);
  } catch (e) {
    throw mapErrorToResponse(e);
  }
};

export default function OrganizationRoute() {
  const organization = useLoaderData<typeof loader>();
  const event = useRouteLoaderData('routes/organizer.$orga.$event') as OrganizerEventRouteData;

  return (
    <>
      <PageHeader>
        <Container>
          <OrganizationBreadcrumb organization={organization} event={event} />
          {event ? (
            <EventTabs orgaSlug={organization.slug} eventSlug={event.slug} role={organization.role} />
          ) : (
            <OrganizationTabs slug={organization.slug} role={organization.role} />
          )}
        </Container>
      </PageHeader>

      <Outlet context={{ organization }} />
    </>
  );
}
