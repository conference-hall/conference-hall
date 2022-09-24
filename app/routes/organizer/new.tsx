import type { ActionArgs, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Container } from '~/design-system/Container';
import { sessionRequired } from '~/services/auth/auth.server';
import { OrganizationNewForm } from '~/components/organizations/OrganizationNew';
import { createOrganization, validateOrganizationData } from '~/services/organizers/organizations.server';
import { Form } from '@remix-run/react';
import { Button } from '~/design-system/Buttons';
import { H1, Text } from '~/design-system/Typography';

export const loader: LoaderFunction = async ({ request }) => {
  await sessionRequired(request);
  return null;
};

export const action = async ({ request }: ActionArgs) => {
  const uid = await sessionRequired(request);
  const form = await request.formData();
  const result = validateOrganizationData(form);
  if (!result.success) {
    return result.error.flatten();
  } else {
    const updated = await createOrganization(uid, result.data);
    if (updated?.fieldErrors) return json(updated);
    throw redirect(`/organizer/${updated.slug}`);
  }
};

export default function NewOrganizationRoute() {
  return (
    <Container className="max-w-5xl">
      <div className="mt-12 mb-12 space-y-6 text-center">
        <H1>Create a new organization</H1>
        <Text variant="secondary">
          Give a cool name to your organization. You will be able to invite members and create your first event.
        </Text>
      </div>
      <Form
        action="/organizer/new"
        method="post"
        className="space-y-8 border border-gray-200 bg-white p-8 shadow sm:overflow-hidden sm:rounded-md"
      >
        <OrganizationNewForm />
        <Button type="submit" className="mt-4">
          New organization
        </Button>
      </Form>
    </Container>
  );
}
