import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { Container } from '~/design-system/Container';
import { sessionRequired } from '~/services/auth/auth.server';
import { H2 } from '~/design-system/Typography';
import { Form } from '@remix-run/react';
import { Button } from '~/design-system/Buttons';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return null;
};

export const action = async ({ request }: ActionArgs) => {
  await sessionRequired(request);
};

export default function OrganizationSettingsRoute() {
  return (
    <Container className="my-4 sm:my-8">
      <Form method="post">
        <div className="overflow-hidden border border-gray-200 sm:rounded-md">
          <div className="space-y-6 bg-white py-6 px-4 sm:p-6">
            <H2>Event settings</H2>
          </div>
          <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
            <Button type="submit">Save</Button>
          </div>
        </div>
      </Form>
    </Container>
  );
}
