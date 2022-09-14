import type { LoaderArgs } from '@remix-run/node';
import { sessionRequired } from '~/services/auth/auth.server';
import { H2, Text } from '~/design-system/Typography';
import { Form, useActionData, useOutletContext } from '@remix-run/react';
import { Button } from '~/design-system/Buttons';
import { Input } from '~/design-system/forms/Input';
import type { OrganizerEventContext } from '../../$eventSlug';
import { DateRangeInput } from '~/design-system/forms/DateRangeInput';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return null;
};

export const action = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return null;
};

export default function EventCfpSettingsRoute() {
  const { event } = useOutletContext<OrganizerEventContext>();
  const result = useActionData();
  return (
    <>
      <section>
        <H2 className="border-b border-gray-200 pb-3">Call for paper</H2>
        <Text variant="secondary" className="mt-6">
          Define the period during which the call for papers should be open. The opening and closing of the CFP will be
          done automatically according to these dates and times.
        </Text>
        <Form className="mt-6 space-y-4">
          <DateRangeInput
            start={{ name: 'startDate', label: 'Opening date', value: event.cfpStart }}
            end={{ name: 'endDate', label: 'Closing date', value: event.cfpEnd }}
          />
          <Input
            name="maxProposals"
            label="Maximum of proposals per speaker"
            type="number"
            defaultValue={event.maxProposals || ''}
            autoComplete="off"
            description="Optional. Limits the number of proposals a speaker can submit to the event."
          />
          <Input
            name="codeOfConductUrl"
            label="Code of conduct URL"
            defaultValue={event.codeOfConductUrl || ''}
            error={result?.fieldErrors?.codeOfConductUrl?.[0]}
            description="Optional. Speakers will be required to agree to the code of conduct before submitting their proposal."
          />
          <Button>Update CFP preferences</Button>
        </Form>
      </section>
    </>
  );
}
