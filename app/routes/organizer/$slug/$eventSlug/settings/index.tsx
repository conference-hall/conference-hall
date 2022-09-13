import type { LoaderArgs } from '@remix-run/node';
import { sessionRequired } from '~/services/auth/auth.server';
import { H2 } from '~/design-system/Typography';
import { Form, useOutletContext } from '@remix-run/react';
import { EventInfoForm } from '~/components/event-forms/EventInfoForm';
import { Button } from '~/design-system/Buttons';
import { Input } from '~/design-system/forms/Input';
import type { OrganizerEventContext } from '../../$eventSlug';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return null;
};

export default function EventGeneralSettingsRoute() {
  const { event } = useOutletContext<OrganizerEventContext>();
  return (
    <>
      <section>
        <H2 className="border-b border-gray-200 pb-3">General</H2>
        <Form className="mt-6 space-y-4">
          <EventInfoForm type="CONFERENCE" initialValues={event} />
          <Button>Update event</Button>
        </Form>
      </section>
      <section>
        <H2 className="border-b border-gray-200 pb-4">Additional information</H2>
        <Form className="mt-6 space-y-4">
          <Input name="website" label="Website URL" />
          <Input name="cod" label="Code of conduct URL" />
          <Input name="contact" label="Contact email" />
          <Button variant="secondary">Update additional information</Button>
        </Form>
      </section>
    </>
  );
}
