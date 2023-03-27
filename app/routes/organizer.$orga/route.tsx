import invariant from 'tiny-invariant';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Container } from '~/design-system/Container';
import { sessionRequired } from '~/libs/auth/auth.server';
import { Outlet, useCatch, useLoaderData, useMatches } from '@remix-run/react';
import { ButtonLink } from '~/design-system/Buttons';
import { mapErrorToResponse } from '~/libs/errors';
import OrganizationBreadcrumb from '~/shared-components/organizations/OrganizationBreadcrumb';
import { getOrganization } from './server/get-organization.server';
import { OrganizationTabs } from './components/OrganizationTabs';

export type OrganizationContext = {
  organization: Awaited<ReturnType<typeof getOrganization>>;
};

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
  const matches = useMatches();
  const isEventPage = matches.filter((m) => m.handle?.isEventPage).length > 0;

  return (
    <>
      {!isEventPage && (
        <>
          <header className="bg-gray-800">
            <Container>
              <OrganizationBreadcrumb title="Organization page" organization={organization} />
            </Container>
          </header>
          <OrganizationTabs slug={organization.slug} role={organization.role} />
        </>
      )}
      <Outlet context={{ organization }} />
    </>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  return (
    <Container className="mt-8 px-8 py-32 text-center">
      <h1 className="text-8xl font-black text-indigo-400">{caught.status}</h1>
      <p className="mt-10 text-4xl font-bold text-gray-600">{caught.data}</p>
      <ButtonLink to="/organizer" variant="secondary" className="mt-16">
        Your organizations
      </ButtonLink>
    </Container>
  );
}
