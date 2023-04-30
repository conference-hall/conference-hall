import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useLoaderData, useSearchParams } from '@remix-run/react';
import { requireSession } from '~/libs/auth/session';
import { H3, Subtitle } from '~/design-system/Typography';
import { Card } from '~/design-system/layouts/Card';
import invariant from 'tiny-invariant';
import { MembersFilterSchema, listMembers } from './server/list-members.server';
import { removeMember } from './server/remove-member.server';
import { changeMemberRole } from './server/change-role.server';
import { ChangeRoleButton, InviteMemberButton, RemoveButton } from './components/MemberActions';
import { useOrganization } from '../organizer.$orga/route';
import { useUser } from '~/root';
import { AvatarName } from '~/design-system/Avatar';
import { createToast } from '~/libs/toasts/toasts';
import type { OrganizationRole } from '@prisma/client';
import { withZod } from '@remix-validated-form/with-zod';
import { parsePage } from '~/schemas/pagination';
import { Pagination } from '~/design-system/Pagination';
import { Input } from '~/design-system/forms/Input';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { EmptyState } from '~/design-system/layouts/EmptyState';
import { CubeTransparentIcon } from '@heroicons/react/24/outline';

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireSession(request);
  invariant(params.orga, 'Invalid organization slug');

  const url = new URL(request.url);
  const filters = await withZod(MembersFilterSchema).validate(url.searchParams);
  const page = await parsePage(url.searchParams);

  const members = await listMembers(params.orga, userId, filters.data ?? {}, page);
  return json(members);
};

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await requireSession(request);
  invariant(params.orga, 'Invalid organization slug');

  const form = await request.formData();
  const action = form.get('_action')!;
  const memberId = String(form.get('_memberId'))!;

  switch (action) {
    case 'change-role': {
      const memberRole = form.get('memberRole') as OrganizationRole;
      await changeMemberRole(params.orga, userId, memberId, memberRole);
      const toast = await createToast(request, 'Member role changed');
      return json(null, toast);
    }
    case 'remove-member': {
      await removeMember(params.orga, userId, memberId);
      const toast = await createToast(request, 'Member removed from organization');
      return json(null, toast);
    }
  }
  return null;
};

export default function OrganizationSettingsRoute() {
  const { user } = useUser();
  const [searchParams] = useSearchParams();
  const { organization } = useOrganization();
  const { results, pagination } = useLoaderData<typeof loader>();

  return (
    <Card as="section">
      <Card.Title>
        <H3 size="l" mb={1}>
          Members
        </H3>
        <Subtitle>Invite, remove or change role of organization members.</Subtitle>
      </Card.Title>

      <Card.Content>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Form method="GET">
            <Input
              type="search"
              name="query"
              aria-label="Find member"
              placeholder="Find member"
              defaultValue={searchParams.get('query') || ''}
              icon={MagnifyingGlassIcon}
            />
          </Form>
          <InviteMemberButton invitationLink={organization.invitationLink} />
        </div>

        {results.length > 0 ? (
          <Form method="POST" preventScrollReset>
            <div className="overflow-hidden bg-white sm:rounded-md sm:border sm:border-gray-200 sm:shadow-sm">
              <ul aria-label="Members list" className="divide-y divide-gray-200">
                {results.map((member) => (
                  <li key={member.id}>
                    <div className="flex flex-col px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                      <AvatarName
                        picture={member.picture}
                        name={member.name || 'Unknown'}
                        subtitle={member.role.toLowerCase()}
                      />
                      {user?.id !== member.id && (
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
          </Form>
        ) : (
          <EmptyState icon={CubeTransparentIcon} label="No member found." />
        )}

        <Pagination {...pagination} />
      </Card.Content>
    </Card>
  );
}
