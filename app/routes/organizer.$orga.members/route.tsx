import invariant from 'tiny-invariant';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import type { OrganizationRole } from '@prisma/client';
import { json } from '@remix-run/node';
import { Container } from '~/design-system/Container';
import { sessionRequired } from '~/libs/auth/auth.server';
import { useLoaderData, useOutletContext } from '@remix-run/react';
import { AvatarName } from '~/design-system/Avatar';
import { ChangeRoleButton, InviteMemberButton, RemoveButton } from '~/components/MemberActions';
import { Input } from '~/design-system/forms/Input';
import type { OrganizationContext } from '../organizer.$orga/route';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { getUserRole } from '~/shared/organizations/get-user-role.server';
import { removeMember } from './remove-member.server';
import { changeMemberRole } from './change-role.server';
import { listMembers } from './list-members.server';
import { getInvitationLink } from './get-invitation-link.server';

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  invariant(params.orga, 'Invalid organization slug');

  const role = await getUserRole(params.orga, uid);
  if (role === 'REVIEWER') throw new Response('Forbidden', { status: 403 });

  const invitationLink = await getInvitationLink(params.orga, uid);
  const members = await listMembers(params.orga, uid);
  return json({ userId: uid, userRole: role, invitationLink, members });
};

export const action = async ({ request, params }: ActionArgs) => {
  const { uid } = await sessionRequired(request);
  invariant(params.orga, 'Invalid organization slug');

  const form = await request.formData();
  const action = form.get('_action')!;
  const memberId = String(form.get('_memberId'))!;

  if (action === 'remove-member') {
    await removeMember(params.orga, uid, memberId);
  } else if (action === 'change-role') {
    const memberRole = form.get('memberRole') as OrganizationRole;
    await changeMemberRole(params.orga, uid, memberId, memberRole);
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
                <div className="flex flex-col px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <AvatarName
                    photoURL={member.photoURL}
                    name={member.name || 'Unknown'}
                    subtitle={member.role.toLowerCase()}
                  />
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
