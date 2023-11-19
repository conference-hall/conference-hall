import { parse } from '@conform-to/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Button } from '~/design-system/Buttons.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { H2, Subtitle } from '~/design-system/Typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { redirectWithToast } from '~/libs/toasts/toast.server.ts';
import { TeamForm } from '~/routes/__components/teams/TeamForm.tsx';

import { useTeam } from '../$team.tsx';
import { updateTeam } from './__server/update-team.server.ts';
import { TeamSaveSchema } from './__types/team-save.schema.ts';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  const form = await request.formData();
  invariant(params.team, 'Invalid team slug');

  const result = parse(form, { schema: TeamSaveSchema });
  if (!result.value) return json(result.error);

  const team = await updateTeam(params.team, userId, result.value);
  if (team?.fieldErrors) return json(team.fieldErrors);

  return redirectWithToast(`/team/${team.slug}/settings`, 'success', 'Team settings saved.');
};

export default function OrganizationSettingsRoute() {
  const { team } = useTeam();
  const errors = useActionData<typeof action>();

  return (
    <Card as="section">
      <Form method="POST" preventScrollReset>
        <Card.Title>
          <H2>General</H2>
          <Subtitle>Change team name and URL.</Subtitle>
        </Card.Title>

        <Card.Content>
          <TeamForm initialValues={team} errors={errors ?? undefined} />
        </Card.Content>

        <Card.Actions>
          <Button type="submit">Save</Button>
        </Card.Actions>
      </Form>
    </Card>
  );
}
