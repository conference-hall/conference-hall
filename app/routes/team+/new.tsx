import { parseWithZod } from '@conform-to/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { Form, redirect, useActionData } from 'react-router';

import { TeamCreateSchema, UserTeams } from '~/.server/team/user-teams.ts';
import { Button } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { TeamForm } from '~/routes/__components/teams/team-form.tsx';

import { FullscreenPage } from '../__components/fullscreen-page.tsx';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireSession(request);

  const form = await request.formData();
  const result = parseWithZod(form, { schema: TeamCreateSchema });
  if (result.status !== 'success') return result.error;

  try {
    const team = await UserTeams.for(userId).create(result.value);
    throw redirect(`/team/${team.slug}`);
  } catch (_error) {
    return { slug: ['This URL already exists, please try another one.'] };
  }
};

export default function NewTeamRoute() {
  const errors = useActionData<typeof action>();

  return (
    <FullscreenPage navbar="default">
      <FullscreenPage.Title
        title="Create a new team."
        subtitle="Give a cool name to your team. You will be able to invite members and create your first event."
      />

      <Card>
        <Card.Content>
          <Form id="new-team-form" method="POST" className="space-y-8">
            <TeamForm errors={errors} />
          </Form>
        </Card.Content>
        <Card.Actions>
          <Button type="submit" className="mt-4" form="new-team-form">
            Create team
          </Button>
        </Card.Actions>
      </Card>
    </FullscreenPage>
  );
}
