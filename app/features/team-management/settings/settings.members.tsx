import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { CubeTransparentIcon } from '@heroicons/react/24/outline';
import type { TeamRole } from '@prisma/client';
import { useTranslation } from 'react-i18next';
import { Form, useSearchParams } from 'react-router';
import { parseUrlPage } from '~/.server/shared/pagination.ts';
import { parseUrlFilters, TeamMembers } from '~/.server/team/team-members.ts';
import { useCurrentTeam } from '~/routes/components/contexts/team-context.tsx';
import { useUser } from '~/routes/components/contexts/user-context.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import { AvatarName } from '~/shared/design-system/avatar.tsx';
import { Input } from '~/shared/design-system/forms/input.tsx';
import { Card } from '~/shared/design-system/layouts/card.tsx';
import { EmptyState } from '~/shared/design-system/layouts/empty-state.tsx';
import { Pagination } from '~/shared/design-system/list/pagination.tsx';
import { H3, Subtitle } from '~/shared/design-system/typography.tsx';
import { i18n } from '~/shared/i18n/i18n.server.ts';
import { toast } from '~/shared/toasts/toast.server.ts';
import type { Route } from './+types/settings.members.ts';
import { ChangeRoleButton, InviteMemberButton, RemoveButton } from './components/member-actions.tsx';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const filters = parseUrlFilters(request.url);
  const page = parseUrlPage(request.url);
  return TeamMembers.for(userId, params.team).list(filters, page);
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);
  const t = await i18n.getFixedT(request);
  const form = await request.formData();
  const intent = form.get('intent')!;
  const memberId = String(form.get('memberId'))!;
  const members = TeamMembers.for(userId, params.team);

  switch (intent) {
    case 'change-role': {
      await members.changeRole(memberId, form.get('memberRole') as TeamRole);
      return toast('success', t('team.settings.members.feedbacks.role-changed'));
    }
    case 'remove-member': {
      await members.remove(memberId);
      return toast('success', t('team.settings.members.feedbacks.removed'));
    }
  }
  return null;
};

export default function TeamMembersRoute({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const user = useUser();
  const currentTeam = useCurrentTeam();
  const { canManageTeamMembers } = currentTeam.userPermissions;
  const { results, pagination } = loaderData;
  const [searchParams] = useSearchParams();

  return (
    <Card as="section">
      <Card.Title>
        <H3 size="base">{t('team.settings.members.heading')}</H3>
        {canManageTeamMembers ? <Subtitle>{t('team.settings.members.description')}</Subtitle> : null}
      </Card.Title>

      <Card.Content>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Form method="GET" className="grow">
            <Input
              type="search"
              name="query"
              aria-label={t('team.settings.members.search')}
              placeholder={t('team.settings.members.search')}
              defaultValue={searchParams.get('query') || ''}
              icon={MagnifyingGlassIcon}
            />
          </Form>
          {canManageTeamMembers ? <InviteMemberButton invitationLink={currentTeam.invitationLink} /> : null}
        </div>

        {results.length > 0 ? (
          <Form method="POST" preventScrollReset>
            <div className="overflow-hidden bg-white sm:rounded-md sm:border sm:border-gray-200 sm:shadow-xs">
              <ul aria-label={t('team.settings.members.list')} className="divide-y divide-gray-200">
                {results.map((member) => (
                  <li key={member.id}>
                    <div className="flex flex-col px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <AvatarName
                        picture={member.picture}
                        name={member.name || t('common.unknown')}
                        subtitle={t(`common.member.role.label.${member.role}`)}
                      />
                      {canManageTeamMembers && user?.id !== member.id && (
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
          <EmptyState icon={CubeTransparentIcon} label={t('team.settings.members.list.empty')} />
        )}

        <Pagination {...pagination} />
      </Card.Content>
    </Card>
  );
}
