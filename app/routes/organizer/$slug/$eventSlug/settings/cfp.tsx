import type { LoaderArgs } from '@remix-run/node';
import { sessionRequired } from '~/services/auth/auth.server';
import { H2 } from '~/design-system/Typography';
import { Form } from '@remix-run/react';
import { Button } from '~/design-system/Buttons';
import CfpForm from '~/components/event-forms/CfpForm';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return null;
};

export default function EventCfpSettingsRoute() {
  return (
    <>
      <section>
        <H2 className="border-b border-gray-200 pb-3">Call for paper</H2>
        <Form className="mt-6 space-y-4">
          <CfpForm />
          <Button>Update CFP preferences</Button>
        </Form>
      </section>
    </>
  );
}
