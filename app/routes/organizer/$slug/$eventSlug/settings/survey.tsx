import type { LoaderArgs } from '@remix-run/node';
import { sessionRequired } from '~/services/auth/auth.server';
import { H2, Text } from '~/design-system/Typography';
import { Button } from '~/design-system/Buttons';
import { Form } from '@remix-run/react';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return null;
};

export default function EventSurveySettingsRoute() {
  return (
    <>
      <section>
        <H2 className="border-b border-gray-200 pb-3">Speaker survey</H2>
        <Button className="mt-6">Enable survey</Button>
      </section>
      <section>
        <H2 className="border-b border-gray-200 pb-3">Questions</H2>
        <Text variant="secondary" className="mt-6">
          Select questions that you want to ask to speakers.
        </Text>
        <Form className="mt-6 space-y-4">
          <Button disabled>Save questions</Button>
        </Form>
      </section>
    </>
  );
}
