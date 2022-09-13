import type { LoaderArgs } from '@remix-run/node';
import { sessionRequired } from '~/services/auth/auth.server';
import { H2, Text } from '~/design-system/Typography';
import { Form, useOutletContext } from '@remix-run/react';
import { Button } from '~/design-system/Buttons';
import { Input } from '~/design-system/forms/Input';
import type { OrganizerEventContext } from '../../$eventSlug';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return null;
};

export default function EventCfpSettingsRoute() {
  const { event } = useOutletContext<OrganizerEventContext>();
  return (
    <>
      <section>
        <H2 className="border-b border-gray-200 pb-3">Call for paper</H2>
        <Text variant="secondary" className="mt-6">
          Define the period during which the call for papers should be open. The opening and closing of the CFP will be
          done automatically according to these dates and times.
        </Text>
        <Form className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <Input
              name="startDate"
              label="Opening date"
              defaultValue={event.cfpStart}
              autoComplete="off"
              className="col-span-2 sm:col-span-1"
            />
            <Input
              name="endDate"
              label="Closing date"
              defaultValue={event.cfpEnd}
              autoComplete="off"
              className="col-span-2 sm:col-span-1"
            />
          </div>
          <Input
            name="maxProposals"
            label="Maximum of proposals per speaker"
            type="number"
            defaultValue={event.maxProposals || ''}
            autoComplete="off"
          />
          <Button>Update CFP preferences</Button>
        </Form>
      </section>
    </>
  );
}
