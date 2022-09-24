import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Container } from '~/design-system/Container';
import { sessionRequired } from '~/services/auth/auth.server';
import { H1, H2 } from '~/design-system/Typography';
import { getOrganization } from '~/services/organizers/organizations.server';
import { Link, Outlet, useCatch, useLoaderData, useMatches } from '@remix-run/react';
import { ButtonLink } from '~/design-system/Buttons';
import { mapErrorToResponse } from '~/services/errors';
import Badge from '~/design-system/Badges';
import { OrganizationTabs } from '~/components/organizations/OrganizationTabs';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { HomeIcon } from '@heroicons/react/20/solid';

export type OrganizationContext = {
  organization: Awaited<ReturnType<typeof getOrganization>>;
};

export const loader = async ({ request, params }: LoaderArgs) => {
  const uid = await sessionRequired(request);
  try {
    const slug = params.slug!;
    const organization = await getOrganization(slug, uid);
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
          <Container className="my-4 flex flex-row items-center gap-4">
            <H1 className="sr-only">Organization page</H1>
            <H2 className="flex items-center gap-4">
              <Link to="/organizer" className="truncate hover:underline">
                <HomeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </Link>
              <ChevronRightIcon className="h-4 w-4 text-gray-600" />
              <Link to={`/organizer/${organization.slug}`} className="hover:underline">
                {organization.name}
              </Link>
            </H2>
            <Badge>{organization.role.toLowerCase()}</Badge>
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
