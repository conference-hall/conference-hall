import { parseWithZod } from '@conform-to/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { TeamUpdateSchema, UserTeam } from '~/.server/team/user-team.ts';
import { Button } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { redirectWithToast } from '~/libs/toasts/toast.server.ts';
import { TeamForm } from '~/routes/__components/teams/team-form.tsx';

import { TeamMembers } from '~/.server/team/team-members.ts';
import { useTeam } from '../__components/use-team.tsx';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');

  const form = await request.formData();
  const intent = form.get('intent') as string;

  switch (intent) {
    case 'save-team': {
      const result = parseWithZod(form, { schema: TeamUpdateSchema });
      if (result.status !== 'success') return json(result.error);

      try {
        const team = await UserTeam.for(userId, params.team).updateSettings(result.value);
        return redirectWithToast(`/team/${team.slug}/settings`, 'success', 'Team settings saved.');
      } catch (SlugAlreadyExistsError) {
        return json({ slug: ['This URL already exists, please try another one.'] });
      }
    }
    case 'leave-team': {
      await TeamMembers.for(userId, params.team).leave();
      return redirectWithToast('/speaker', 'success', "You've successfully left the team.");
    }
  }
  return null;
};

export default function TeamSettingsRoute() {
  const errors = useActionData<typeof action>();
  const { team } = useTeam();
  const { canEditTeam } = team.userPermissions;

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
              <TeamForm initialValues={team} errors={errors} />
            </Card.Content>

            <Card.Actions>
              <Button type="submit" name="intent" value="save-team">
                Save
              </Button>
            </Card.Actions>
          </Form>
        </Card>
      ) : (
        <Card as="section">
          <Form
            method="POST"
            preventScrollReset
            onSubmit={(event) => {
              if (!confirm(`Are you sure you want to leave the "${team.name}" team?`)) {
                event.preventDefault();
              }
            }}
          >
            <Card.Title>
              <H2>Leave the "{team.name}" team</H2>
              <Subtitle>
                If you leave the team, you’ll lose access to it and won’t be able to manage its events.
              </Subtitle>
            </Card.Title>

            <Card.Content>
              <div>
                <Button type="submit" name="intent" value="leave-team" variant="important">
                  Leave "{team.name}" team
                </Button>
              </div>
            </Card.Content>
          </Form>
        </Card>
      )}
    </div>
  );
}
