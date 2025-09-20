import { CubeTransparentIcon } from '@heroicons/react/24/outline';
import type { TeamRole } from 'prisma/generated/enums.ts';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { useUser } from '~/app-platform/components/user-context.tsx';
import { AvatarName } from '~/design-system/avatar.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { List } from '~/design-system/list/list.tsx';
import { H3, Subtitle, Text } from '~/design-system/typography.tsx';
import { useCurrentTeam } from '~/features/team-management/team-context.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import { i18n } from '~/shared/i18n/i18n.server.ts';
import { parseUrlPage } from '~/shared/pagination/pagination.ts';
import { toast } from '~/shared/toasts/toast.server.ts';
import type { Route } from './+types/settings.members.ts';
import { ChangeRoleButton, InviteMemberButton, RemoveButton } from './components/member-actions.tsx';
import { MemberFilters } from './components/member-filters.tsx';
import { parseUrlFilters, TeamMembers } from './services/team-members.server.ts';

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
  const { members, pagination, statistics } = loaderData;

  return (
    <Card as="section">
      <Card.Title className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div>
          <H3 size="base">
            {t('team.settings.members.heading')} ({statistics.total})
          </H3>
          {canManageTeamMembers ? <Subtitle>{t('team.settings.members.description')}</Subtitle> : null}
        </div>
        {canManageTeamMembers ? <InviteMemberButton invitationLink={currentTeam.invitationLink} /> : null}
      </Card.Title>

      <Card.Content>
        <MemberFilters />

        <Form method="POST" preventScrollReset>
          <List>
            <List.Header>
              <Text>{t('team.settings.members.count', { count: statistics.total })}</Text>
            </List.Header>

            <List.Content aria-label={t('team.settings.members.list')}>
              {members.map((member) => (
                <List.Row key={member.id} className="flex flex-col p-4 sm:flex-row sm:items-center sm:justify-between">
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
                </List.Row>
              ))}

              {members.length === 0 ? (
                <EmptyState icon={CubeTransparentIcon} label={t('team.settings.members.list.empty')} noBorder />
              ) : null}
            </List.Content>

            <List.PaginationFooter current={pagination.current} pages={pagination.total} total={statistics.total} />
          </List>
        </Form>
      </Card.Content>
    </Card>
  );
}
