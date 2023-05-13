import type { ActionArgs, LoaderFunction } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { json, redirect } from '@remix-run/node';
import { requireSession } from '~/libs/auth/session';
import { TeamForm } from '~/components/teams/TeamForm';
import { Button } from '~/design-system/Buttons';
import { TeamSaveSchema, createTeam } from './server/create-team.server';
import { Container } from '~/design-system/layouts/Container';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle';
import { Card } from '~/design-system/layouts/Card';
import { parse } from '@conform-to/zod';

export const loader: LoaderFunction = async ({ request }) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request }: ActionArgs) => {
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
