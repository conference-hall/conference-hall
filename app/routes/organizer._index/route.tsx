import type { ActionArgs, LoaderFunction } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { json, redirect } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { requireSession } from '~/libs/auth/cookies';
import { OrganizationForm } from '~/shared-components/organizations/OrganizationForm';
import { Button } from '~/design-system/Buttons';
import { createOrganization } from './server/create-organization.server';
import { OrganizationSaveSchema } from './types/organization-save.schema';
import { Container } from '~/design-system/layouts/Container';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle';
import { Card } from '~/design-system/layouts/Card';

export const loader: LoaderFunction = async ({ request }) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request }: ActionArgs) => {
  const { uid } = await requireSession(request);
  const form = await request.formData();
  const result = await withZod(OrganizationSaveSchema).validate(form);
  if (result.error) {
    return json(result.error.fieldErrors);
  } else {
    const updated = await createOrganization(uid, result.data);
    if (updated?.fieldErrors) return json(updated.fieldErrors);
    throw redirect(`/organizer/${updated.slug}`);
  }
};

export default function NewOrganizationRoute() {
  const errors = useActionData<typeof action>();

  return (
    <>
      <PageHeaderTitle
        title="Create a new organization"
        subtitle="Give a cool name to your organization. You will be able to invite members and create your first event."
      />
      <Container className="mt-8">
        <Card p={8}>
          <Form method="POST" className="space-y-8">
            <OrganizationForm errors={errors} />
            <Button type="submit" className="mt-4">
              New organization
            </Button>
          </Form>
        </Card>
      </Container>
    </>
  );
}
