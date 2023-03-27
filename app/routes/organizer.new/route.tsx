import type { ActionArgs, LoaderFunction } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { json, redirect } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { sessionRequired } from '~/libs/auth/auth.server';
import { OrganizationForm } from '~/shared-components/organizations/OrganizationForm';
import { Container } from '~/design-system/Container';
import { Button } from '~/design-system/Buttons';
import { H1, Text } from '~/design-system/Typography';
import { createOrganization } from './server/create-organization.server';
import { OrganizationSaveSchema } from './types/organization-save.schema';

export const loader: LoaderFunction = async ({ request }) => {
  await sessionRequired(request);
  return null;
};

export const action = async ({ request }: ActionArgs) => {
  const { uid } = await sessionRequired(request);
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
    <Container className="max-w-5xl">
      <div className="mt-12 mb-12 space-y-6 text-center">
        <H1>Create a new organization</H1>
        <Text type="secondary">
          Give a cool name to your organization. You will be able to invite members and create your first event.
        </Text>
      </div>
      <Form
        action="/organizer/new"
        method="post"
        className="space-y-8 border border-gray-200 bg-white p-8 shadow sm:overflow-hidden sm:rounded-md"
      >
        <OrganizationForm errors={errors} />
        <Button type="submit" className="mt-4">
          New organization
        </Button>
      </Form>
    </Container>
  );
}
