import invariant from 'tiny-invariant';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { requireSession } from '~/libs/auth/session';
import { H3, Subtitle } from '~/design-system/Typography';
import { Button } from '~/design-system/Buttons';
import { OrganizationForm } from '~/shared-components/organizations/OrganizationForm';
import { updateOrganization } from './server/update-organization.server';
import { OrganizationSaveSchema } from './types/organization-save.schema';
import { Card } from '~/design-system/layouts/Card';
import { useOrganization } from '../organizer.$orga/route';
import { addToast } from '~/libs/toasts/toasts';

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await requireSession(request);
  const form = await request.formData();
  invariant(params.orga, 'Invalid organization slug');

  const result = await withZod(OrganizationSaveSchema).validate(form);
  if (result.error) return json(result.error.fieldErrors);

  const organization = await updateOrganization(params.orga, userId, result.data);
  if (organization?.fieldErrors) return json(organization.fieldErrors);

  return redirect(`/organizer/${organization.slug}/settings`, await addToast(request, 'Organization saved.'));
};

export default function OrganizationSettingsRoute() {
  const { organization } = useOrganization();
  const errors = useActionData<typeof action>();

  return (
    <Card as="section">
      <Form method="POST" preventScrollReset>
        <Card.Title>
          <H3 size="base">General</H3>
          <Subtitle>Change organization name and URL.</Subtitle>
        </Card.Title>

        <Card.Content>
          <OrganizationForm initialValues={organization} errors={errors ?? undefined} />
        </Card.Content>

        <Card.Actions>
          <Button type="submit">Save</Button>
        </Card.Actions>
      </Form>
    </Card>
  );
}
