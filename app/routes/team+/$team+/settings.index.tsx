import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { TeamUpdateSchema, UserTeam } from '~/.server/team/user-team.ts';
import { Button } from '~/design-system/buttons.cap.tsx';
import { Card } from '~/design-system/layouts/card.cap.tsx';
import { H2, Subtitle } from '~/design-system/typography.cap.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { redirectWithToast } from '~/libs/toasts/toast.server.ts';
import { parseWithZod } from '~/libs/zod-parser.ts';
import { TeamForm } from '~/routes/__components/teams/team-form.tsx';

import { useTeam } from '../__components/use-team.tsx';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  const form = await request.formData();
  invariant(params.team, 'Invalid team slug');

  const result = parseWithZod(form, TeamUpdateSchema);
  if (!result.value) return json(result.error);

  try {
    const team = await UserTeam.for(userId, params.team).updateSettings(result.value);
    return redirectWithToast(`/team/${team.slug}/settings`, 'success', 'Team settings saved.');
  } catch (SlugAlreadyExistsError) {
    return json({ slug: 'This URL already exists, please try another one.' });
  }
};

export default function TeamSettingsRoute() {
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
          <TeamForm initialValues={team} errors={errors} />
        </Card.Content>

        <Card.Actions>
          <Button type="submit">Save</Button>
        </Card.Actions>
      </Form>
    </Card>
  );
}
