import { CubeTransparentIcon } from '@heroicons/react/24/outline';
import type { TeamRole } from 'prisma/generated/client.ts';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { useUser, useUserTeamPermissions } from '~/app-platform/components/user-context.tsx';
import { AvatarName } from '~/design-system/avatar.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { List } from '~/design-system/list/list.tsx';
import { H3, Subtitle, Text } from '~/design-system/typography.tsx';
import { useCurrentTeam } from '~/features/team-management/team-context.tsx';
import { AuthorizedTeamContext } from '~/shared/authorization/authorization.middleware.ts';
import { getI18n } from '~/shared/i18n/i18n.middleware.ts';
import { parseUrlPage } from '~/shared/pagination/pagination.ts';
import { toast } from '~/shared/toasts/toast.server.ts';
import type { Route } from './+types/settings.members.ts';
import { ChangeRoleButton, InviteMemberButton, RemoveButton } from './components/member-actions.tsx';
import { MemberFilters } from './components/member-filters.tsx';
import { parseUrlFilters, TeamMembers } from './services/team-members.server.ts';

export const loader = async ({ request, context }: Route.LoaderArgs) => {
  const filters = parseUrlFilters(request.url);
  const page = parseUrlPage(request.url);

  const authorizedTeam = context.get(AuthorizedTeamContext);
  return TeamMembers.for(authorizedTeam).list(filters, page);
};

export const action = async ({ request, context }: Route.ActionArgs) => {
  const i18n = getI18n(context);
  const form = await request.formData();
  const intent = form.get('intent')!;
  const memberId = String(form.get('memberId'))!;

  const authorizedTeam = context.get(AuthorizedTeamContext);
  const members = TeamMembers.for(authorizedTeam);

  switch (intent) {
    case 'change-role': {
      await members.changeRole(memberId, form.get('memberRole') as TeamRole);
      return toast('success', i18n.t('team.settings.members.feedbacks.role-changed'));
    }
    case 'remove-member': {
      await members.remove(memberId);
      return toast('success', i18n.t('team.settings.members.feedbacks.removed'));
    }
  }
  return null;
};

export default function TeamMembersRoute({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const user = useUser();
  const currentTeam = useCurrentTeam();
  const permissions = useUserTeamPermissions();

  const { members, pagination, statistics } = loaderData;

  return (
    <Card as="section">
      <Card.Title className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <H3 size="base">
            {t('team.settings.members.heading')} ({statistics.total})
          </H3>
          {permissions.canManageTeamMembers ? <Subtitle>{t('team.settings.members.description')}</Subtitle> : null}
        </div>
        {permissions.canManageTeamMembers ? <InviteMemberButton invitationLink={currentTeam.invitationLink} /> : null}
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
                  {permissions.canManageTeamMembers && user?.id !== member.id && (
                    <div className="mt-4 flex w-full gap-2 sm:mt-0 sm:w-auto">
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
