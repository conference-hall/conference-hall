import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { CubeTransparentIcon } from '@heroicons/react/24/outline';
import type { TeamRole } from '@prisma/client';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useLoaderData, useSearchParams } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { AvatarName } from '~/design-system/Avatar.tsx';
import { Input } from '~/design-system/forms/Input.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { EmptyState } from '~/design-system/layouts/EmptyState.tsx';
import { Pagination } from '~/design-system/Pagination.tsx';
import { H3, Subtitle } from '~/design-system/Typography.tsx';
import { parseUrlFilters, TeamMembers } from '~/domains/organizer-team/TeamMembers.ts';
import { parseUrlPage } from '~/domains/shared/Pagination.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { useUser } from '~/root.tsx';

import { useTeam } from '../$team.tsx';
import { ChangeRoleButton, InviteMemberButton, RemoveButton } from './__components/MemberActions.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');

  const filters = parseUrlFilters(request.url);
  const page = parseUrlPage(request.url);

  const members = await TeamMembers.for(userId, params.team).list(filters, page);
  return json(members);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');

  const form = await request.formData();
  const action = form.get('_action')!;
  const memberId = String(form.get('_memberId'))!;

  const members = TeamMembers.for(userId, params.team);
  switch (action) {
    case 'change-role': {
      await members.changeRole(memberId, form.get('memberRole') as TeamRole);
      return toast('success', 'Member role changed.');
    }
    case 'remove-member': {
      await members.remove(memberId);
      return toast('success', 'Member removed from team.');
    }
  }
  return null;
};

export default function TeamMembersRoute() {
  const { user } = useUser();
  const { team } = useTeam();
  const [searchParams] = useSearchParams();
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
                        <div className="flex w-full gap-2 mt-4 sm:mt-0 sm:w-auto">
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
