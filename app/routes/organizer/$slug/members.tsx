import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import type { OrganizationRole } from '@prisma/client';
import { json } from '@remix-run/node';
import { Container } from '~/design-system/Container';
import { sessionRequired } from '~/services/auth/auth.server';
import { Text } from '~/design-system/Typography';
import {
  changeMemberRole,
  getInvitationLink,
  getOrganizationMembers,
  getUserRole,
  removeMember,
} from '~/services/organizers/organizations.server';
import { useLoaderData, useOutletContext } from '@remix-run/react';
import { Avatar } from '~/design-system/Avatar';
import { ChangeRoleButton, InviteMemberButton, RemoveButton } from '~/components/MemberActions';
import { Input } from '~/design-system/forms/Input';
import type { OrganizationContext } from '../$slug';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';

export const loader = async ({ request, params }: LoaderArgs) => {
  const uid = await sessionRequired(request);
  const slug = params.slug!;
  const role = await getUserRole(slug, uid);
  if (role === 'REVIEWER') throw new Response('Forbidden', { status: 403 });

  const invitationLink = await getInvitationLink(slug, uid);
  const members = await getOrganizationMembers(slug, uid);
  return json({ userId: uid, userRole: role, invitationLink, members });
};

export const action = async ({ request, params }: ActionArgs) => {
  const uid = await sessionRequired(request);
  const slug = params.id!;
  const form = await request.formData();
  const action = form.get('_action')!;
  const memberId = String(form.get('_memberId'))!;

  if (action === 'remove-member') {
    await removeMember(slug, uid, memberId);
  } else if (action === 'change-role') {
    const memberRole = form.get('memberRole') as OrganizationRole;
    await changeMemberRole(slug, uid, memberId, memberRole);
  }
  return null;
};

export default function OrganizationMembersRoute() {
  const { organization } = useOutletContext<OrganizationContext>();
  const { userId, userRole, invitationLink, members } = useLoaderData<typeof loader>();

  return (
    <>
      <Container className="my-4 sm:my-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="sr-only">Organization members</h2>
          <Input
            name="query"
            type="search"
            aria-label="Find a member"
            placeholder="Find a member"
            className="w-full sm:w-80"
            icon={MagnifyingGlassIcon}
          />
          {userRole === 'OWNER' && <InviteMemberButton id={organization.id} invitationLink={invitationLink} />}
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
                  {userId !== member.id && userRole === 'OWNER' && (
                    <div className="flex w-full gap-2 sm:w-auto">
                      <ChangeRoleButton memberId={member.id} memberName={member.name} memberRole={member.role} />
                      <RemoveButton memberId={member.id} memberName={member.name} />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </>
  );
}
