import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Container } from '~/design-system/Container';
import { sessionRequired } from '~/services/auth/auth.server';
import { H1, Text } from '~/design-system/Typography';
import { hasOrganizerAccess } from '~/services/organizers/access.server';
import { getOrganizations } from '~/services/organizers/organizations.server';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { Link, useLoaderData } from '@remix-run/react';
import { ButtonLink } from '~/design-system/Buttons';

export const loader = async ({ request }: LoaderArgs) => {
  const uid = await sessionRequired(request);
  const hasAccess = await hasOrganizerAccess(uid);
  if (!hasAccess) return redirect('/organizer/request');

  const organizations = await getOrganizations(uid);
  if (organizations.length === 0) return redirect('/organizer/welcome');
  if (organizations.length === 1) return redirect(`/organizer/${organizations[0].slug}`);

  return json(organizations);
};

export default function OrganizerRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <Container className="my-4 sm:my-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <H1>Organizations</H1>
        <ButtonLink variant="secondary" to="/organizer/new" size="small" className="mt-4 sm:mt-0">
          New organization
        </ButtonLink>
      </div>
      <div className="my-4 overflow-hidden border border-gray-200 bg-white shadow-sm sm:my-8 sm:rounded-md">
        <ul aria-label="Organizations list" className="divide-y divide-gray-200">
          {data.map((orga) => (
            <li key={orga.slug}>
              <Link to={`/organizer/${orga.slug}`} className="block hover:bg-gray-50">
                <div className="flex px-4 py-4 sm:px-6">
                  <div className="min-w-0 flex-1 truncate sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-baseline text-sm">
                      <Text as="p" variant="link" className="truncate font-medium">
                        {orga.name}
                      </Text>
                      <Text as="p" variant="secondary" size="xs" className="ml-1 truncate font-normal">
                        as {orga.role.toLowerCase()}
                      </Text>
                    </div>
                  </div>
                  <div className="ml-5 flex-shrink-0">
                    <ChevronRightIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Container>
  );
}
