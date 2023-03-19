import invariant from 'tiny-invariant';
import type { ChangeEvent } from 'react';
import { json } from '@remix-run/node';
import type { LoaderArgs } from '@remix-run/node';
import { Form, useActionData, useOutletContext, useSubmit } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { H2 } from '~/design-system/Typography';
import { Checkbox } from '~/design-system/forms/Checkboxes';
import { Input } from '~/design-system/forms/Input';
import { Button } from '~/design-system/Buttons';
import { sessionRequired } from '~/libs/auth/auth.server';
import { EventEmailNotificationsSettingsSchema, EventNotificationsSettingsSchema } from '~/schemas/event';
import type { OrganizerEventContext } from '../organizer.$orga.$event/route';
import { updateEvent } from '~/shared/organizations/update-event.server';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return null;
};

export const action = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
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
  const { event } = useOutletContext<OrganizerEventContext>();
  const errors = useActionData<typeof action>();

  const submit = useSubmit();

  function handleChange(event: ChangeEvent<HTMLFormElement>) {
    submit(event.currentTarget);
  }

  return (
    <>
      <section>
        <H2 className="border-b border-gray-200 pb-3">Email notifications</H2>
        <Form method="post" className="mt-6 space-y-4">
          <Input
            name="emailOrganizer"
            label="Notification email"
            defaultValue={event.emailOrganizer || ''}
            error={errors?.emailOrganizer}
          />
          <input type="hidden" name="_action" value="save-email-notifications" />
          <Button type="submit">Save email notifications</Button>
        </Form>
      </section>
      <section>
        <H2 className="border-b border-gray-200 pb-3">Notifications</H2>
        <Form method="post" onChange={handleChange} className="mt-6 space-y-4">
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
      </section>
    </>
  );
}
