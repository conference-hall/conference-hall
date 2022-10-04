import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { redirect, json } from '@remix-run/node';
import { Form, useActionData, useOutletContext } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { getUserRole, updateOrganization } from '~/services/organizers/organizations.server';
import { sessionRequired } from '~/services/auth/auth.server';
import { Container } from '~/design-system/Container';
import { H2 } from '~/design-system/Typography';
import { Button } from '~/design-system/Buttons';
import { OrganizationNewForm } from '~/components/organizations/OrganizationNew';
import { OrganizationSaveSchema } from '~/schemas/organization';
import type { OrganizationContext } from '../$slug';

export const loader = async ({ request, params }: LoaderArgs) => {
  const uid = await sessionRequired(request);
  const slug = params.slug!;
  const role = await getUserRole(slug, uid);
  if (role !== 'OWNER') throw new Response('Forbidden', { status: 403 });
  return null;
};

export const action = async ({ request, params }: ActionArgs) => {
  const uid = await sessionRequired(request);
  const form = await request.formData();
  const result = await withZod(OrganizationSaveSchema).validate(form);
  if (result.error) {
    return json(result.error.fieldErrors);
  } else {
    const updated = await updateOrganization(params.slug!, uid, result.data);
    if (updated?.fieldErrors) return json(updated);
    throw redirect(`/organizer/${updated.slug}/settings`);
  }
};

export default function OrganizationSettingsRoute() {
  const { organization } = useOutletContext<OrganizationContext>();
  const errors = useActionData();

  return (
    <Container className="my-4 sm:my-8">
      <Form method="post">
        <div className="overflow-hidden border border-gray-200 sm:rounded-md">
          <div className="space-y-6 bg-white py-6 px-4 sm:p-6">
            <H2>Organization settings</H2>
            <OrganizationNewForm initialValues={organization} errors={errors} />
          </div>
          <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
            <Button type="submit">Save</Button>
          </div>
        </div>
      </Form>
    </Container>
  );
}
