import type { LoaderArgs } from '@remix-run/node';
import { sessionRequired } from '~/services/auth/auth.server';
import { H2 } from '~/design-system/Typography';
import { Form, useOutletContext } from '@remix-run/react';
import { EventInfoForm } from '~/components/event-forms/EventInfoForm';
import { Button } from '~/design-system/Buttons';
import { Input } from '~/design-system/forms/Input';
import type { OrganizerEventContext } from '../../$eventSlug';
import { MarkdownTextArea } from '~/design-system/forms/MarkdownTextArea';

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
        <H2 className="border-b border-gray-200 pb-4">Event details</H2>
        <Form className="mt-6 space-y-4">
          <Input name="address" label="Venue address or city" autoComplete="off" defaultValue={event?.address ?? ''} />
          {event.type === 'CONFERENCE' && (
            <div className="grid grid-cols-2 gap-6">
              <Input
                name="startDate"
                label="Start date"
                autoComplete="off"
                defaultValue={event?.conferenceStart || ''}
                className="col-span-2 sm:col-span-1"
              />
              <Input
                name="endDate"
                label="End date"
                autoComplete="off"
                defaultValue={event?.conferenceEnd || ''}
                className="col-span-2 sm:col-span-1"
              />
            </div>
          )}
          <MarkdownTextArea
            name="description"
            label="Description"
            defaultValue={event?.description}
            required
            rows={5}
            autoComplete="off"
          />
          <Input name="websiteUrl" label="Website URL" defaultValue={event.websiteUrl || ''} />
          <Input name="codeOfConductUrl" label="Code of conduct URL" defaultValue={event.codeOfConductUrl || ''} />
          <Input name="contactEmail" label="Contact email" defaultValue={event.contactEmail || ''} />
          <Button>Update event details</Button>
        </Form>
      </section>
    </>
  );
}
