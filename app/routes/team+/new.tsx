import { parseWithZod } from '@conform-to/zod';
import { Form, redirect } from 'react-router';
import { TeamCreateSchema, UserTeams } from '~/.server/team/user-teams.ts';
import { Button } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { requireUserSession } from '~/libs/auth/session.ts';
import { FullscreenPage } from '../components/fullscreen-page.tsx';
import { TeamForm } from '../components/teams/team-form.tsx';
import type { Route } from './+types/new.ts';

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireUserSession(request);
  return null;
};

export const action = async ({ request }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);
  const form = await request.formData();
  const result = await parseWithZod(form, { schema: TeamCreateSchema, async: true });
  if (result.status !== 'success') return result.error;

  const team = await UserTeams.for(userId).create(result.value);
  return redirect(`/team/${team.slug}`);
};

export default function NewTeamRoute({ actionData: errors }: Route.ComponentProps) {
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
