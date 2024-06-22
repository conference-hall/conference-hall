import type { ActionFunctionArgs, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';

import { TeamCreateSchema, UserTeams } from '~/.server/team/UserTeams.ts';
import { Button } from '~/design-system/Buttons.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { PageHeaderTitle } from '~/design-system/layouts/page-header-title.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { parseWithZod } from '~/libs/zod-parser.ts';
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
    <>
      <PageHeaderTitle
        title="Create a new team"
        subtitle="Give a cool name to your team. You will be able to invite members and create your first event."
      />
      <Page>
        <Card p={8}>
          <Form method="POST" className="space-y-8">
            <TeamForm errors={errors} />
            <Button type="submit" className="mt-4">
              New team
            </Button>
          </Form>
        </Card>
      </Page>
    </>
  );
}
