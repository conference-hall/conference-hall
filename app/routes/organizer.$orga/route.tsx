import invariant from 'tiny-invariant';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { requireSession } from '~/libs/auth/session';
import { Outlet, useLoaderData, useOutletContext, useRouteLoaderData } from '@remix-run/react';
import { mapErrorToResponse } from '~/libs/errors';
import OrganizationBreadcrumb from '~/shared-components/organizations/OrganizationBreadcrumb';
import type { Organization } from './server/get-organization.server';
import { getOrganization } from './server/get-organization.server';
import { OrganizationTabs } from './components/OrganizationTabs';
import { PageHeader } from '~/design-system/layouts/PageHeader';
import { EventTabs } from './components/EventTabs';
import { Container } from '~/design-system/layouts/Container';
import { EventCreateSchema } from './types/event-create.schema';
import { withZod } from '@remix-validated-form/with-zod';
import { createEvent } from './server/create-event.server';
import { useUser } from '~/root';
import type { OrganizerEvent } from '../organizer.$orga.$event/server/get-organizer-event.server';

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireSession(request);
  invariant(params.orga, 'Invalid organization slug');

  try {
    const organization = await getOrganization(params.orga, userId);
    return json(organization);
  } catch (e) {
    throw mapErrorToResponse(e);
  }
};

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await requireSession(request);
  invariant(params.orga, 'Invalid organization slug');
  const form = await request.formData();

  const result = await withZod(EventCreateSchema).validate(form);
  if (result.error) return json(result.error.fieldErrors);

  const event = await createEvent(params.orga, userId, result.data);
  if (event.error) return json(event.error?.fieldErrors);

  return redirect(`/organizer/${params.orga}/${event.slug}/settings`);
};

export default function OrganizationRoute() {
  const { user } = useUser();
  const organization = useLoaderData<typeof loader>();
  const event = useRouteLoaderData('routes/organizer.$orga.$event') as OrganizerEvent;

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

      <Outlet context={{ user, organization }} />
    </>
  );
}

export function useOrganization() {
  return useOutletContext<{ organization: Organization }>();
}
