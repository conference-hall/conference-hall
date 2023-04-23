import invariant from 'tiny-invariant';
import type { ChangeEvent } from 'react';
import { json } from '@remix-run/node';
import type { LoaderArgs } from '@remix-run/node';
import { Form, useActionData, useSubmit } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { H2 } from '~/design-system/Typography';
import { Checkbox } from '~/design-system/forms/Checkboxes';
import { Input } from '~/design-system/forms/Input';
import { Button } from '~/design-system/Buttons';
import { requireSession } from '~/libs/auth/cookies';
import { updateEvent } from '~/shared-server/organizations/update-event.server';
import { useOrganizerEvent } from '../organizer.$orga.$event/route';
import { EventEmailNotificationsSettingsSchema } from './types/event-email-notifications-settings.schema';
import { EventNotificationsSettingsSchema } from './types/event-notifications-settings.schema';
import { Card } from '~/design-system/layouts/Card';

export const loader = async ({ request }: LoaderArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: LoaderArgs) => {
  const { uid } = await requireSession(request);
  invariant(params.orga, 'Invalid organization slug');
  invariant(params.event, 'Invalid event slug');
  const form = await request.formData();
  const action = form.get('_action');

  switch (action) {
    case 'save-email-notifications': {
      const result = await withZod(EventEmailNotificationsSettingsSchema).validate(form);
      if (result.error) return json(result.error.fieldErrors);
      await updateEvent(params.orga, params.event, uid, result.data);
      break;
    }
    case 'save-notifications': {
      const result = await withZod(EventNotificationsSettingsSchema).validate(form);
      if (!result.error) await updateEvent(params.orga, params.event, uid, result.data);
      break;
    }
  }
  return json(null);
};

export default function EventNotificationsSettingsRoute() {
  const { event } = useOrganizerEvent();
  const errors = useActionData<typeof action>();

  const submit = useSubmit();

  function handleChange(event: ChangeEvent<HTMLFormElement>) {
    submit(event.currentTarget);
  }

  return (
    <>
      <Card as="section">
        <Card.Title>
          <H2 size="xl">Email notifications</H2>
        </Card.Title>

        <Card.Content>
          <Form method="POST" id="email-notified">
            <Input
              name="emailOrganizer"
              label="Email receiving notifications"
              placeholder="contact@email.com"
              defaultValue={event.emailOrganizer || ''}
              error={errors?.emailOrganizer}
            />
            <input type="hidden" name="_action" value="save-email-notifications" />
          </Form>

          <Form method="POST" onChange={handleChange} className="space-y-4">
            <input type="hidden" name="_action" value="save-notifications" />
            <Checkbox
              id="submitted"
              name="emailNotifications"
              description="Receive an email when a speaker submit a talk."
              value="submitted"
              defaultChecked={event.emailNotifications?.includes('submitted')}
            >
              Submitted proposals
            </Checkbox>
            <Checkbox
              id="confirmed"
              name="emailNotifications"
              description="Receive an email when a speaker confirm a talk."
              value="confirmed"
              defaultChecked={event.emailNotifications?.includes('confirmed')}
            >
              Confirmed proposals
            </Checkbox>
            <Checkbox
              id="declined"
              name="emailNotifications"
              description="Receive an email when a speaker decline a talk."
              value="declined"
              defaultChecked={event.emailNotifications?.includes('declined')}
            >
              Declined proposals
            </Checkbox>
            <Checkbox
              id="accepted"
              name="emailNotifications"
              description="Have a copy of acceptation emails sent to speakers."
              value="accepted"
              defaultChecked={event.emailNotifications?.includes('accepted')}
            >
              Accepted proposals
            </Checkbox>
            <Checkbox
              id="rejected"
              name="emailNotifications"
              description="Have a copy of rejection emails sent to speakers."
              value="rejected"
              defaultChecked={event.emailNotifications?.includes('rejected')}
            >
              Rejected proposals
            </Checkbox>
          </Form>
        </Card.Content>

        <Card.Actions>
          <Button type="submit" form="email-notified">
            Save email notifications
          </Button>
        </Card.Actions>
      </Card>
    </>
  );
}
