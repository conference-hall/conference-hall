import invariant from 'tiny-invariant';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { sessionRequired } from '~/libs/auth/auth.server';
import { H3, Subtitle } from '~/design-system/Typography';
import { Button } from '~/design-system/Buttons';
import { OrganizationForm } from '~/shared-components/organizations/OrganizationForm';
import { updateOrganization } from './server/update-organization.server';
import { OrganizationSaveSchema } from './types/organization-save.schema';
import { Card } from '~/design-system/layouts/Card';
import { useOrganization } from '../organizer.$orga/route';
import { createToast } from '~/libs/toasts/toasts';

export const loader = async ({ request, params }: LoaderArgs) => {
  await sessionRequired(request);
  return null;
};

export const action = async ({ request, params }: ActionArgs) => {
  const { uid, session } = await sessionRequired(request);
  const form = await request.formData();
  invariant(params.orga, 'Invalid organization slug');

  const result = await withZod(OrganizationSaveSchema).validate(form);
  if (result.error) return json(result.error.fieldErrors);

  const organization = await updateOrganization(params.orga, uid, result.data);
  if (organization?.fieldErrors) return json(organization.fieldErrors);

  const toast = await createToast(session, 'Organization successfully updated');
  return redirect(`/organizer/${organization.slug}/settings`, toast);
};

export default function OrganizationSettingsRoute() {
  const { organization } = useOrganization();
  const errors = useActionData<typeof action>();

  return (
    <Card as="section">
      <Form method="POST" preventScrollReset>
        <div className="px-8 pt-8">
          <H3 size="xl" mb={0}>
            General
          </H3>
          <Subtitle>Change organization name and URL.</Subtitle>
        </div>

        <div className="grid grid-cols-1 gap-6 p-8">
          <OrganizationForm initialValues={organization} errors={errors ?? undefined} />
        </div>

        <div className="flex justify-end gap-4 border-t border-t-gray-200 px-8 py-4">
          <Button type="submit">Save</Button>
        </div>
      </Form>
    </Card>
  );
}
