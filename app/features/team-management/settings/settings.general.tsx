import { parseWithZod } from '@conform-to/zod/v4';
import { Trans, useTranslation } from 'react-i18next';
import { Form, href, redirect } from 'react-router';
import { useUserTeamPermissions } from '~/app-platform/components/user-context.tsx';
import { Button } from '~/design-system/button.tsx';
import { DeleteModalButton } from '~/design-system/dialogs/delete-modal.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2, Subtitle, Text } from '~/design-system/typography.tsx';
import { TeamForm } from '~/features/team-management/creation/components/team-form.tsx';
import { useCurrentTeam } from '~/features/team-management/team-context.tsx';
import { AuthorizedTeamContext } from '~/shared/authorization/authorization.middleware.ts';
import { getI18n } from '~/shared/i18n/i18n.middleware.ts';
import { toastHeaders } from '~/shared/toasts/toast.server.ts';
import type { Route } from './+types/settings.general.ts';
import { TeamMembers } from './services/team-members.server.ts';
import { TeamSettings } from './services/team-settings.server.ts';

export const action = async ({ request, context }: Route.ActionArgs) => {
  const i18n = getI18n(context);
  const authorizedTeam = context.get(AuthorizedTeamContext);

  const form = await request.formData();
  const intent = form.get('intent') as string;
  switch (intent) {
    case 'save-team': {
      const userTeam = TeamSettings.for(authorizedTeam);
      const schema = await userTeam.buildUpdateSchema();
      const result = await parseWithZod(form, { schema, async: true });
      if (result.status !== 'success') return result.error;

      const team = await userTeam.updateSettings(result.value);
      const headers = await toastHeaders('success', i18n.t('team.settings.feedbacks.saved'));
      return redirect(href('/team/:team/settings', { team: team.slug }), { headers });
    }
    case 'leave-team': {
      await TeamMembers.for(authorizedTeam).leave();
      const headers = await toastHeaders('success', i18n.t('team.settings.feedbacks.team-left'));
      return redirect(href('/speaker'), { headers });
    }
    case 'delete-team': {
      await TeamSettings.for(authorizedTeam).delete();
      const headers = await toastHeaders('success', i18n.t('team.settings.feedbacks.deleted'));
      return redirect(href('/speaker'), { headers });
    }
  }
  return null;
};

export default function TeamSettingsRoute({ actionData: errors }: Route.ComponentProps) {
  const { t } = useTranslation();
  const currentTeam = useCurrentTeam();
  const permissions = useUserTeamPermissions();

  return (
    <div className="space-y-4 lg:space-y-8">
      {permissions.canEditTeam ? (
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

        <ul className="mt-8 divide-y border-t">
          {permissions.canLeaveTeam ? (
            <li className="flex flex-col gap-6 p-4 sm:flex-row sm:items-center lg:px-8">
              <div className="grow space-y-1">
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

          {permissions.canDeleteTeam ? (
            <li className="flex flex-col gap-6 p-4 sm:flex-row sm:items-center lg:px-8">
              <div className="grow space-y-1">
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
