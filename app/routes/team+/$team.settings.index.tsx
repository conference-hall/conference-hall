import { parse } from '@conform-to/zod';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { TeamForm } from '~/components/teams/TeamForm';
import { Button } from '~/design-system/Buttons';
import { Card } from '~/design-system/layouts/Card';
import { H2, Subtitle } from '~/design-system/Typography';
import { requireSession } from '~/libs/auth/session';
import { addToast } from '~/libs/toasts/toasts';

import { useTeam } from './$team';
import { updateTeam } from './server/update-team.server';
import { TeamSaveSchema } from './types/team-save.schema';

export const loader = async ({ request }: LoaderArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await requireSession(request);
  const form = await request.formData();
  invariant(params.team, 'Invalid team slug');

  const result = parse(form, { schema: TeamSaveSchema });
  if (!result.value) return json(result.error);

  const team = await updateTeam(params.team, userId, result.value);
  if (team?.fieldErrors) return json(team.fieldErrors);

  return redirect(`/team/${team.slug}/settings`, await addToast(request, 'Team settings saved.'));
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
