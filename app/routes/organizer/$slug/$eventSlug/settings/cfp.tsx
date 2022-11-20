import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { sessionRequired } from '~/services/auth/auth.server';
import { H2, Text } from '~/design-system/Typography';
import { Form, useActionData, useOutletContext } from '@remix-run/react';
import { Button } from '~/design-system/Buttons';
import { Input } from '~/design-system/forms/Input';
import type { OrganizerEventContext } from '../../$eventSlug';
import { DateRangeInput } from '~/design-system/forms/DateRangeInput';
import { Checkbox } from '~/design-system/forms/Checkboxes';
import { withZod } from '@remix-validated-form/with-zod';
import { EventCfpSettingsSchema } from '~/schemas/event';
import { updateEvent } from '~/services/organizer-event/update-event.server';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return null;
};

export const action = async ({ request, params }: ActionArgs) => {
  const { uid } = await sessionRequired(request);
  const { slug, eventSlug } = params;
  const form = await request.formData();
  const result = await withZod(EventCfpSettingsSchema).validate(form);
  if (result.error) {
    return json(result.error.fieldErrors);
  }
  await updateEvent(slug!, eventSlug!, uid, result.data);
  return json(null);
};

export default function EventCfpSettingsRoute() {
  const { event } = useOutletContext<OrganizerEventContext>();
  const errors = useActionData<typeof action>();
  return (
    <>
      <section>
        <H2 className="border-b border-gray-200 pb-3">Call for paper</H2>
        <Form method="post" className="mt-6 space-y-4">
          <input type="hidden" name="type" value={event.type} />
          {event.type === 'CONFERENCE' ? (
            <>
              <Text variant="secondary" className="mt-6">
                Define the period during which the call for papers should be open. The opening and closing of the CFP
                will be done automatically according to these dates and times.
              </Text>
              <DateRangeInput
                start={{ name: 'cfpStart', label: 'Opening date', value: event.cfpStart }}
                end={{ name: 'cfpEnd', label: 'Closing date', value: event.cfpEnd }}
                error={errors?.cfpStart}
              />
            </>
          ) : (
            <Checkbox
              id="cfpStart"
              name="cfpStart"
              description="The call for paper will be opened until this checkbox is checked."
              value={new Date().toISOString()}
              defaultChecked={Boolean(event.cfpStart)}
            >
              Call for paper opened
            </Checkbox>
          )}
          <Input
            name="maxProposals"
            label="Maximum of proposals per speaker"
            type="number"
            defaultValue={event.maxProposals || ''}
            autoComplete="off"
            description="Optional. Limits the number of proposals a speaker can submit to the event."
            error={errors?.maxProposals}
          />
          <Input
            name="codeOfConductUrl"
            label="Code of conduct URL"
            defaultValue={event.codeOfConductUrl || ''}
            description="Optional. Speakers will be required to agree to the code of conduct before submitting their proposal."
            error={errors?.codeOfConductUrl}
          />
          <Button>Update CFP preferences</Button>
        </Form>
      </section>
    </>
  );
}
