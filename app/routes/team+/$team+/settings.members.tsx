import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { CubeTransparentIcon } from '@heroicons/react/24/outline';
import type { TeamRole } from '@prisma/client';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useLoaderData, useSearchParams } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { parseUrlPage } from '~/.server/shared/pagination.ts';
import { TeamMembers, parseUrlFilters } from '~/.server/team/team-members.ts';
import { AvatarName } from '~/design-system/avatar.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { Pagination } from '~/design-system/list/pagination.tsx';
import { H3, Subtitle } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { useUser } from '~/routes/__components/use-user.tsx';

import { ROLE_NAMES } from '~/libs/formatters/team-roles.ts';
import { useTeam } from '../__components/use-team.tsx';
import { ChangeRoleButton, InviteMemberButton, RemoveButton } from './__components/member-actions.tsx';

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
  const intent = form.get('intent')!;
  const memberId = String(form.get('memberId'))!;

  const members = TeamMembers.for(userId, params.team);
  switch (intent) {
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

  const { canEditTeam } = team.userPermissions;

  return (
    <Card as="section">
      <Card.Title>
        <H3 size="base">Members</H3>
        {canEditTeam ? <Subtitle>Invite, remove or change role of team members.</Subtitle> : null}
      </Card.Title>

      <Card.Content>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Form method="GET" className="grow">
            <Input
              type="search"
              name="query"
              aria-label="Find member"
              placeholder="Find member"
              defaultValue={searchParams.get('query') || ''}
              icon={MagnifyingGlassIcon}
            />
          </Form>
          {canEditTeam ? <InviteMemberButton invitationLink={team.invitationLink} /> : null}
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
                        subtitle={ROLE_NAMES[member.role]}
                      />
                      {canEditTeam && user?.id !== member.id && (
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
