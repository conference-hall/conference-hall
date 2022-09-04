import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Container } from '~/design-system/Container';
import { sessionRequired } from '~/services/auth/auth.server';
import { H3, Text } from '~/design-system/Typography';
import { ButtonLink } from '~/design-system/Buttons';
import { getOrganizationMembers } from '~/services/organizers/organizations';
import { useLoaderData } from '@remix-run/react';
import { TrashIcon } from '@heroicons/react/20/solid';

export const loader = async ({ request, params }: LoaderArgs) => {
  const uid = await sessionRequired(request);
  const slug = params.slug!;
  const members = await getOrganizationMembers(slug, uid);
  return json(members);
};

export default function OrganizationMembersRoute() {
  const members = useLoaderData<typeof loader>();

  return (
    <>
      <Container className="my-4 sm:my-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <H3>Members</H3>
          <ButtonLink to="new" size="small" className="mt-4 sm:mt-0">
            Invite member
          </ButtonLink>
        </div>
        <div className="my-4 overflow-hidden border border-gray-200 bg-white shadow-sm sm:my-8 sm:rounded-md">
          <ul aria-label="Members list" className="divide-y divide-gray-200">
            {members.map((member) => (
              <li key={member.name}>
                <div className="flex px-4 py-4 sm:px-6">
                  <div className="min-w-0 flex-1 truncate sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-baseline text-sm">
                      <Text as="p" variant="link" className="truncate font-medium">
                        {member.name}
                      </Text>
                      <Text as="p" variant="secondary" size="xs" className="ml-1 truncate font-normal">
                        {member.role.toLowerCase()}
                      </Text>
                    </div>
                  </div>
                  <div className="ml-5 flex-shrink-0">
                    <TrashIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </>
  );
}
