import invariant from 'tiny-invariant';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { redirect, json } from '@remix-run/node';
import { Form, useActionData, useOutletContext } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { sessionRequired } from '~/libs/auth/auth.server';
import { Container } from '~/design-system/Container';
import { H2 } from '~/design-system/Typography';
import { Button } from '~/design-system/Buttons';
import { OrganizationForm } from '~/shared-components/organizations/OrganizationForm';
import { OrganizationSaveSchema } from '~/schemas/organization';
import type { OrganizationContext } from '../organizer.$orga/route';
import { getUserRole } from '~/shared-server/organizations/get-user-role.server';
import { updateOrganization } from './server/update-organization.server';

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  invariant(params.orga, 'Invalid organization slug');

  const role = await getUserRole(params.orga, uid);
  if (role !== 'OWNER') throw new Response('Forbidden', { status: 403 });
  return null;
};

export const action = async ({ request, params }: ActionArgs) => {
  const { uid } = await sessionRequired(request);
  const form = await request.formData();
  invariant(params.orga, 'Invalid organization slug');

  const result = await withZod(OrganizationSaveSchema).validate(form);
  if (result.error) {
    return json(result.error.fieldErrors);
  } else {
    const updated = await updateOrganization(params.orga, uid, result.data);
    if (updated?.fieldErrors) return json(updated.fieldErrors);
    throw redirect(`/organizer/${updated.slug}/settings`);
  }
};

export default function OrganizationSettingsRoute() {
  const { organization } = useOutletContext<OrganizationContext>();
  const errors = useActionData<typeof action>();

  return (
    <Container className="my-4 sm:my-8">
      <Form method="post">
        <div className="overflow-hidden border border-gray-200 sm:rounded-md">
          <div className="space-y-6 bg-white py-6 px-4 sm:p-6">
            <H2>Organization settings</H2>
            <OrganizationForm initialValues={organization} errors={errors} />
          </div>
          <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
            <Button type="submit">Save</Button>
          </div>
        </div>
      </Form>
    </Container>
  );
}
