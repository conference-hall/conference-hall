import { parse } from '@conform-to/zod';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { CubeTransparentIcon } from '@heroicons/react/24/outline';
import type { TeamRole } from '@prisma/client';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useLoaderData, useSearchParams } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { AvatarName } from '~/design-system/Avatar';
import { Input } from '~/design-system/forms/Input';
import { Card } from '~/design-system/layouts/Card';
import { EmptyState } from '~/design-system/layouts/EmptyState';
import { Pagination } from '~/design-system/Pagination';
import { H3, Subtitle } from '~/design-system/Typography';
import { requireSession } from '~/libs/auth/session';
import { addToast } from '~/libs/toasts/toasts';
import { useUser } from '~/root';
import { parsePage } from '~/routes/__types/pagination';

import { ChangeRoleButton, InviteMemberButton, RemoveButton } from './__components/MemberActions';
import { changeMemberRole } from './__server/change-role.server';
import { listMembers, MembersFilterSchema } from './__server/list-members.server';
import { removeMember } from './__server/remove-member.server';
import { useTeam } from './$team';

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');

  const url = new URL(request.url);
  const filters = parse(url.searchParams, { schema: MembersFilterSchema });
  const page = parsePage(url.searchParams);

  const members = await listMembers(params.team, userId, filters.value || {}, page);
  return json(members);
};

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');

  const form = await request.formData();
  const action = form.get('_action')!;
  const memberId = String(form.get('_memberId'))!;

  switch (action) {
    case 'change-role': {
      const memberRole = form.get('memberRole') as TeamRole;
      await changeMemberRole(params.team, userId, memberId, memberRole);
      return json(null, await addToast(request, 'Member role changed.'));
    }
    case 'remove-member': {
      await removeMember(params.team, userId, memberId);
      return json(null, await addToast(request, 'Member removed from team.'));
    }
  }
  return null;
};

export default function OrganizationSettingsRoute() {
  const { user } = useUser();
  const [searchParams] = useSearchParams();
  const { team } = useTeam();
  const { results, pagination } = useLoaderData<typeof loader>();

  return (
    <Card as="section">
      <Card.Title>
        <H3 size="base">Members</H3>
        <Subtitle>Invite, remove or change role of team members.</Subtitle>
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
          <InviteMemberButton invitationLink={team.invitationLink} />
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
