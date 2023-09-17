import { parse } from '@conform-to/zod';
import type { ActionFunctionArgs, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';

import { Button } from '~/design-system/Buttons.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { Container } from '~/design-system/layouts/Container.tsx';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { TeamForm } from '~/routes/__components/teams/TeamForm.tsx';

import { createTeam, TeamSaveSchema } from './__server/create-team.server.ts';

export const loader: LoaderFunction = async ({ request }) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireSession(request);

  const form = await request.formData();
  const result = await parse(form, { schema: TeamSaveSchema, async: true });

  if (result.value) {
    const updated = await createTeam(userId, result.value);
    return redirect(`/team/${updated.slug}`);
  }
  return json(result.error);
};

export default function NewOrganizationRoute() {
  const errors = useActionData<typeof action>();

  return (
    <>
      <PageHeaderTitle
        title="Create a new team"
        subtitle="Give a cool name to your team. You will be able to invite members and create your first event."
      />
      <Container className="mt-8">
        <Card p={8}>
          <Form method="POST" className="space-y-8">
            <TeamForm errors={errors} />
            <Button type="submit" className="mt-4">
              New team
            </Button>
          </Form>
        </Card>
      </Container>
    </>
  );
}
