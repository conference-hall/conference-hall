import type { ActionArgs, LoaderFunction } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { json, redirect } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { requireSession } from '~/libs/auth/session';
import { TeamForm } from '~/shared-components/teams/TeamForm';
import { Button } from '~/design-system/Buttons';
import { createTeam } from './server/create-team.server';
import { TeamSaveSchema } from './types/team-save.schema';
import { Container } from '~/design-system/layouts/Container';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle';
import { Card } from '~/design-system/layouts/Card';

export const loader: LoaderFunction = async ({ request }) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request }: ActionArgs) => {
  const userId = await requireSession(request);
  const form = await request.formData();
  const result = await withZod(TeamSaveSchema).validate(form);
  if (result.error) {
    return json(result.error.fieldErrors);
  } else {
    const updated = await createTeam(userId, result.data);
    if (updated?.fieldErrors) return json(updated.fieldErrors);
    return redirect(`/team/${updated.slug}`);
  }
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
