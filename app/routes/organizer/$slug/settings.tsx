import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Container } from '~/design-system/Container';
import { sessionRequired } from '~/services/auth/auth.server';
import { H2 } from '~/design-system/Typography';
import { Form, useActionData, useOutletContext } from '@remix-run/react';
import { Input } from '~/design-system/forms/Input';
import { Button } from '~/design-system/Buttons';
import type { OrganizationContext } from '../$slug';
import { getUserRole, updateOrganization, validateOrganizationSettingsForm } from '~/services/organizers/organizations';

export const loader = async ({ request, params }: LoaderArgs) => {
  const uid = await sessionRequired(request);
  const slug = params.slug!;
  const role = await getUserRole(slug, uid);
  if (role !== 'OWNER') throw new Response('Forbidden', { status: 403 });
  return json({ name: slug });
};

export const action = async ({ request, params }: ActionArgs) => {
  const uid = await sessionRequired(request);
  const form = await request.formData();
  const result = validateOrganizationSettingsForm(form);
  if (!result.success) {
    return result.error.flatten();
  } else {
    const updated = await updateOrganization(params.slug!, uid, result.data);
    if (updated?.fieldErrors) return json(updated);
    return redirect(`/organizer/${updated.slug}/settings`);
  }
};

export default function OrganizationSettingsRoute() {
  const { organization } = useOutletContext<OrganizationContext>();
  const result = useActionData();

  return (
    <Container className="my-4 sm:my-8">
      <Form method="post">
        <div className="overflow-hidden border border-gray-200 sm:rounded-md">
          <div className="space-y-6 bg-white py-6 px-4 sm:p-6">
            <H2>Organization settings</H2>
            <Input
              name="name"
              label="Name"
              defaultValue={organization.name}
              required
              error={result?.fieldErrors?.name?.[0]}
            />
            <Input
              name="slug"
              label="Slug"
              defaultValue={organization.slug}
              required
              error={result?.fieldErrors?.slug?.[0]}
            />
          </div>
          <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
            <Button type="submit">Save</Button>
          </div>
        </div>
      </Form>
    </Container>
  );
}
