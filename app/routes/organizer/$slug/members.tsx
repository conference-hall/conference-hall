import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Container } from '~/design-system/Container';
import { sessionRequired } from '~/services/auth/auth.server';
import { H3, Text } from '~/design-system/Typography';
import { ButtonLink } from '~/design-system/Buttons';
import { getOrganizationMembers } from '~/services/organizers/organizations';
import { useLoaderData } from '@remix-run/react';
import { Avatar } from '~/design-system/Avatar';
import { ChangeRoleButton, RemoveButton } from '~/components/MemberActions';

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
        <div className="my-8 overflow-hidden bg-white sm:rounded-md sm:border sm:border-gray-200 sm:shadow-sm">
          <ul aria-label="Members list" className="divide-y divide-gray-200">
            {members.map((member) => (
              <li key={member.id}>
                <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:gap-0 sm:px-6">
                  <div className="flex min-w-0 flex-1 items-center">
                    <div className="flex-shrink-0">
                      <Avatar photoURL={member.photoURL} size="m" />
                    </div>
                    <div className="min-w-0 flex-1 px-4">
                      <Text as="p" variant="link" className="truncate font-medium">
                        {member.name}
                      </Text>
                      <Text as="p" variant="secondary" size="sm" className="mt-1 truncate font-normal">
                        {member.role.toLowerCase()}
                      </Text>
                    </div>
                  </div>
                  <div className="flex w-full gap-2 sm:w-auto">
                    <ChangeRoleButton memberId={member.id} memberName={member.name} memberRole={member.role} />
                    <RemoveButton memberId={member.id} memberName={member.name} />
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
