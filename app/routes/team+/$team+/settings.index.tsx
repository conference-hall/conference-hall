import { parseWithZod } from '@conform-to/zod';
import { Form, redirect } from 'react-router';
import { TeamMembers } from '~/.server/team/team-members.ts';
import { UserTeam } from '~/.server/team/user-team.ts';
import { Button } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { toastHeaders } from '~/libs/toasts/toast.server.ts';
import { useCurrentTeam } from '~/routes/components/contexts/team-context.tsx';
import { TeamForm } from '~/routes/components/teams/team-form.tsx';
import type { Route } from './+types/settings.index.ts';

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const userId = await requireSession(request);
  const form = await request.formData();
  const intent = form.get('intent') as string;

  switch (intent) {
    case 'save-team': {
      const userTeam = await UserTeam.for(userId, params.team);
      const schema = await userTeam.buildUpdateSchema();
      const result = await parseWithZod(form, { schema, async: true });
      if (result.status !== 'success') return result.error;

      const team = await userTeam.updateSettings(result.value);
      const headers = await toastHeaders('success', 'Team settings saved.');
      throw redirect(`/team/${team.slug}/settings`, { headers });
    }
    case 'leave-team': {
      await TeamMembers.for(userId, params.team).leave();
      const headers = await toastHeaders('success', "You've successfully left the team.");
      throw redirect('/speaker', { headers });
    }
  }
  return null;
};

export default function TeamSettingsRoute({ actionData: errors }: Route.ComponentProps) {
  const currentTeam = useCurrentTeam();
  const { canEditTeam, canLeaveTeam } = currentTeam.userPermissions;

  return (
    <div className="space-y-8">
      {canEditTeam ? (
        <Card as="section">
          <Form method="POST" preventScrollReset>
            <Card.Title>
              <H2>General</H2>
              <Subtitle>Change team name and URL.</Subtitle>
            </Card.Title>

            <Card.Content>
              <TeamForm initialValues={currentTeam} errors={errors} />
            </Card.Content>

            <Card.Actions>
              <Button type="submit" name="intent" value="save-team">
                Save
              </Button>
            </Card.Actions>
          </Form>
        </Card>
      ) : null}

      {canLeaveTeam ? (
        <Card as="section">
          <Form
            method="POST"
            preventScrollReset
            onSubmit={(event) => {
              if (!confirm(`Are you sure you want to leave the "${currentTeam.name}" team?`)) {
                event.preventDefault();
              }
            }}
          >
            <Card.Title>
              <H2>Leave the "{currentTeam.name}" team</H2>
              <Subtitle>
                If you leave the team, you’ll lose access to it and won’t be able to manage its events.
              </Subtitle>
            </Card.Title>

            <Card.Content>
              <div>
                <Button type="submit" name="intent" value="leave-team" variant="important">
                  Leave "{currentTeam.name}" team
                </Button>
              </div>
            </Card.Content>
          </Form>
        </Card>
      ) : null}
    </div>
  );
}
