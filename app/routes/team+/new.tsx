import type { ActionFunctionArgs, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';

import { TeamCreateSchema, UserTeams } from '~/.server/team/user-teams.ts';
import { Button } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { parseWithZod } from '~/libs/validators/zod-parser.ts';
import { TeamForm } from '~/routes/__components/teams/team-form.tsx';

export const loader: LoaderFunction = async ({ request }) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireSession(request);

  const form = await request.formData();
  const result = parseWithZod(form, TeamCreateSchema);
  if (!result.success) return json(result.error);

  try {
    const team = await UserTeams.for(userId).create(result.value);
    return redirect(`/team/${team.slug}`);
  } catch (SlugAlreadyExistsError) {
    return json({ slug: 'This URL already exists, please try another one.' });
  }
};

export default function NewTeamRoute() {
  const errors = useActionData<typeof action>();

  return (
    <Page>
      <Page.Heading
        title="Create a new team"
        subtitle="Give a cool name to your team. You will be able to invite members and create your first event."
      />

      <Card p={8}>
        <Form method="POST" className="space-y-8">
          <TeamForm errors={errors} />
          <Button type="submit" className="mt-4">
            New team
          </Button>
        </Form>
      </Card>
    </Page>
  );
}
