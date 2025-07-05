import { parseWithZod } from '@conform-to/zod';
import { Trans, useTranslation } from 'react-i18next';
import { Form, href, redirect } from 'react-router';
import { TeamMembers } from '~/.server/team/team-members.ts';
import { UserTeam } from '~/.server/team/user-team.ts';
import { useCurrentTeam } from '~/routes/components/contexts/team-context.tsx';
import { DeleteModalButton } from '~/routes/components/modals/delete-modal.tsx';
import { TeamForm } from '~/routes/components/teams/team-form.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import { Button } from '~/shared/design-system/buttons.tsx';
import { Card } from '~/shared/design-system/layouts/card.tsx';
import { H2, Subtitle, Text } from '~/shared/design-system/typography.tsx';
import { i18n } from '~/shared/i18n/i18n.server.ts';
import { toastHeaders } from '~/shared/toasts/toast.server.ts';
import type { Route } from './+types/settings.general.ts';

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireUserSession(request);
  return null;
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);
  const t = await i18n.getFixedT(request);
  const form = await request.formData();
  const intent = form.get('intent') as string;

  switch (intent) {
    case 'save-team': {
      const userTeam = UserTeam.for(userId, params.team);
      const schema = await userTeam.buildUpdateSchema();
      const result = await parseWithZod(form, { schema, async: true });
      if (result.status !== 'success') return result.error;

      const team = await userTeam.updateSettings(result.value);
      const headers = await toastHeaders('success', t('team.settings.feedbacks.saved'));
      return redirect(href('/team/:team/settings', { team: team.slug }), { headers });
    }
    case 'leave-team': {
      await TeamMembers.for(userId, params.team).leave();
      const headers = await toastHeaders('success', t('team.settings.feedbacks.team-left'));
      return redirect(href('/speaker'), { headers });
    }
    case 'delete-team': {
      await UserTeam.for(userId, params.team).delete();
      const headers = await toastHeaders('success', t('team.settings.feedbacks.deleted'));
      return redirect(href('/speaker'), { headers });
    }
  }
  return null;
};

export default function TeamSettingsRoute({ actionData: errors }: Route.ComponentProps) {
  const { t } = useTranslation();
  const currentTeam = useCurrentTeam();
  const { canEditTeam, canLeaveTeam, canDeleteTeam } = currentTeam.userPermissions;

  return (
    <div className="space-y-8">
      {canEditTeam ? (
        <Card as="section">
          <Form method="POST" preventScrollReset>
            <Card.Title>
              <H2>{t('team.settings.team-edit.heading')}</H2>
              <Subtitle>{t('team.settings.team-edit.description')}</Subtitle>
            </Card.Title>

            <Card.Content>
              <TeamForm initialValues={currentTeam} errors={errors} />
            </Card.Content>

            <Card.Actions>
              <Button type="submit" name="intent" value="save-team">
                {t('team.settings.team-edit.form.submit')}
              </Button>
            </Card.Actions>
          </Form>
        </Card>
      ) : null}

      <Card as="section" className="border-red-300">
        <Card.Title>
          <H2>{t('team.settings.danger.heading')}</H2>
        </Card.Title>

        <ul className="divide-y border-t mt-8">
          {canLeaveTeam ? (
            <li className="p-4 lg:px-8 flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="space-y-1 grow">
                <Text weight="semibold">{t('team.settings.danger.leave-team.heading')}</Text>
                <Subtitle>{t('team.settings.danger.description')}</Subtitle>
              </div>
              <Form
                method="POST"
                preventScrollReset
                onSubmit={(event) => {
                  if (!confirm(t('team.settings.danger.leave-team.confirm', { team: currentTeam.name }))) {
                    event.preventDefault();
                  }
                }}
              >
                <Button type="submit" name="intent" value="leave-team" variant="important">
                  {t('team.settings.danger.leave-team.button')}
                </Button>
              </Form>
            </li>
          ) : null}

          {canDeleteTeam ? (
            <li className="p-4 lg:px-8 flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="space-y-1 grow">
                <Text weight="semibold">{t('team.settings.danger.delete-team.heading')}</Text>
                <Subtitle>
                  <Trans
                    i18nKey="team.settings.danger.delete-team.description"
                    values={{ team: currentTeam.name }}
                    components={[<strong key="1" />]}
                  />
                </Subtitle>
              </div>
              <DeleteModalButton
                intent="delete-team"
                title={t('team.settings.danger.delete-team.modal.heading')}
                description={t('team.settings.danger.delete-team.modal.description', { team: currentTeam.name })}
                confirmationText={currentTeam.slug}
              />
            </li>
          ) : null}
        </ul>
      </Card>
    </div>
  );
}
