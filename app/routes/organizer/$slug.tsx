import type { UserContext } from '~/root';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Container } from '~/design-system/Container';
import { sessionRequired } from '~/services/auth/auth.server';
import { getOrganization } from '~/services/organizers/organizations.server';
import { Outlet, useCatch, useLoaderData, useMatches, useOutletContext } from '@remix-run/react';
import { ButtonLink } from '~/design-system/Buttons';
import { mapErrorToResponse } from '~/services/errors';
import { OrganizationTabs } from '~/components/organizations/OrganizationTabs';
import OrganizationBreadcrumb from '~/components/organizations/OrganizationBreadcrumb';
import { Navbar } from '~/components/Navbar';

export type OrganizationContext = {
  organization: Awaited<ReturnType<typeof getOrganization>>;
};

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  try {
    const slug = params.slug!;
    const organization = await getOrganization(slug, uid);
    return json(organization);
  } catch (e) {
    throw mapErrorToResponse(e);
  }
};

export default function OrganizationRoute() {
  const { user } = useOutletContext<UserContext>();
  const organization = useLoaderData<typeof loader>();
  const matches = useMatches();
  const isEventPage = matches.filter((m) => m.handle?.isEventPage).length > 0;

  return (
    <>
      <Navbar user={user} />
      {!isEventPage && (
        <>
          <Container as="header" className="my-4">
            <OrganizationBreadcrumb title="Organization page" organization={organization} />
          </Container>
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
