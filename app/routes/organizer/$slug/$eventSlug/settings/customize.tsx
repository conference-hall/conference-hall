import type { LoaderArgs } from '@remix-run/node';
import { sessionRequired } from '~/services/auth/auth.server';
import { H2, Text } from '~/design-system/Typography';
import { Form } from '@remix-run/react';
import { Button } from '~/design-system/Buttons';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return null;
};

export default function EventGeneralSettingsRoute() {
  return (
    <>
      <section>
        <H2 className="border-b border-gray-200 pb-4">Customize event banner</H2>
        <Form className="mt-6 space-y-4">
          <Text variant="secondary" className="mt-4">
            Upload your event banner to have a fancy style.
            <ul>
              <li>Best resolution 1500px x 500px</li>
              <li>Only jpeg format</li>
              <li>100kB max (you can optimize your image with squoosh.app)</li>
            </ul>
          </Text>
          <Button variant="secondary">Upload banner</Button>
        </Form>
      </section>
    </>
  );
}
