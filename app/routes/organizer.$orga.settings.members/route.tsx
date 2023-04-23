import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { requireSession } from '~/libs/auth/cookies';
import { H3, Subtitle } from '~/design-system/Typography';
import { Card } from '~/design-system/layouts/Card';
import { getInvitationLink } from './server/get-invitation-link.server';
import invariant from 'tiny-invariant';
import { listMembers } from './server/list-members.server';
import { removeMember } from './server/remove-member.server';
import { changeMemberRole } from './server/change-role.server';
import type { OrganizationRole } from '@prisma/client';
import { ChangeRoleButton, InviteMemberButton, RemoveButton } from './components/MemberActions';
import { useOrganization } from '../organizer.$orga/route';
import { useUser } from '~/root';
import { AvatarName } from '~/design-system/Avatar';
import { createToast } from '~/libs/toasts/toasts';

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await requireSession(request);
  invariant(params.orga, 'Invalid organization slug');

  const invitationLink = await getInvitationLink(params.orga, uid);
  const members = await listMembers(params.orga, uid);
  return json({ invitationLink, members });
};

export const action = async ({ request, params }: ActionArgs) => {
  const { uid } = await requireSession(request);
  invariant(params.orga, 'Invalid organization slug');

  const form = await request.formData();
  const action = form.get('_action')!;
  const memberId = String(form.get('_memberId'))!;

  switch (action) {
    case 'change-role': {
      const memberRole = form.get('memberRole') as OrganizationRole;
      await changeMemberRole(params.orga, uid, memberId, memberRole);
      const toast = await createToast(request, 'Member role changed');
      return json(null, toast);
    }
    case 'remove-member': {
      await removeMember(params.orga, uid, memberId);
      const toast = await createToast(request, 'Member removed from organization');
      return json(null, toast);
    }
  }
  return null;
};

export default function OrganizationSettingsRoute() {
  const { user } = useUser();
  const { organization } = useOrganization();
  const { invitationLink, members } = useLoaderData<typeof loader>();

  const role = user?.organizations.find((orga) => orga.slug === organization.slug)?.role;

  return (
    <Card as="section">
      <Form method="POST" preventScrollReset>
        <Card.Title>
          <H3 size="xl">Organization members</H3>
          <Subtitle>Invite, remove or change role of organization members.</Subtitle>
        </Card.Title>

        <Card.Content>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {role === 'OWNER' && <InviteMemberButton id={organization.id} invitationLink={invitationLink} />}
          </div>

          <div className="overflow-hidden bg-white sm:rounded-md sm:border sm:border-gray-200 sm:shadow-sm">
            <ul aria-label="Members list" className="divide-y divide-gray-200">
              {members.map((member) => (
                <li key={member.id}>
                  <div className="flex flex-col px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <AvatarName
                      photoURL={member.photoURL}
                      name={member.name || 'Unknown'}
                      subtitle={member.role.toLowerCase()}
                    />
                    {user?.id !== member.id && role === 'OWNER' && (
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
        </Card.Content>
      </Form>
    </Card>
  );
}
