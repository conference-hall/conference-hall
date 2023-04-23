import invariant from 'tiny-invariant';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { requireSession } from '~/libs/auth/session';
import { H2 } from '~/design-system/Typography';
import { Form, useActionData } from '@remix-run/react';
import { Button } from '~/design-system/Buttons';
import { Input } from '~/design-system/forms/Input';
import { DateRangeInput } from '~/design-system/forms/DateRangeInput';
import { Checkbox } from '~/design-system/forms/Checkboxes';
import { updateEvent } from '~/shared-server/organizations/update-event.server';
import { EventCfpSettingsSchema } from './types/event-cfp-settings.schema';
import { useOrganizerEvent } from '../organizer.$orga.$event/route';
import { Card } from '~/design-system/layouts/Card';
import { AlertInfo } from '~/design-system/Alerts';

export const loader = async ({ request }: LoaderArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: ActionArgs) => {
  const { uid } = await requireSession(request);
  invariant(params.orga, 'Invalid organization slug');
  invariant(params.event, 'Invalid event slug');
  const form = await request.formData();

  const result = await withZod(EventCfpSettingsSchema).validate(form);
  if (result.error) {
    return json(result.error.fieldErrors);
  }
  await updateEvent(params.orga, params.event, uid, result.data);
  return json(null);
};

export default function EventCfpSettingsRoute() {
  const { event } = useOrganizerEvent();
  const errors = useActionData<typeof action>();

  return (
    <Card as="section">
      <Card.Title>
        <H2 size="xl">Call for paper</H2>
      </Card.Title>

      <Form method="POST">
        <Card.Content>
          <input type="hidden" name="type" value={event.type} />
          {event.type === 'CONFERENCE' ? (
            <div className="space-y-4">
              <DateRangeInput
                start={{ name: 'cfpStart', label: 'Opening date', value: event.cfpStart }}
                end={{ name: 'cfpEnd', label: 'Closing date', value: event.cfpEnd }}
                error={errors?.cfpStart}
              />
              <AlertInfo>
                Define the period during which the call for papers should be open. The opening and closing of the CFP
                will be done automatically according to these dates and times.
              </AlertInfo>
            </div>
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
        </Card.Content>

        <Card.Actions>
          <Button>Update CFP preferences</Button>
        </Card.Actions>
      </Form>
    </Card>
  );
}
