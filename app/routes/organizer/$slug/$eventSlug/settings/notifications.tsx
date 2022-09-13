import type { LoaderArgs } from '@remix-run/node';
import { sessionRequired } from '~/services/auth/auth.server';
import { H2 } from '~/design-system/Typography';
import { Checkbox } from '~/design-system/forms/Checkboxes';
import { Form, useOutletContext } from '@remix-run/react';
import { Input } from '~/design-system/forms/Input';
import type { OrganizerEventContext } from '../../$eventSlug';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return null;
};

export default function EventNotificationsSettingsRoute() {
  const { event } = useOutletContext<OrganizerEventContext>();
  return (
    <>
      <section>
        <H2 className="border-b border-gray-200 pb-3">Email notifications</H2>
        <Form className="mt-6 space-y-4">
          <Input name="contactEmail" label="Notification email" defaultValue={event.emailOrganizer || ''} />
          <Checkbox
            id="emailNotifications.sendToOrganizers"
            name="emailNotifications.sendToOrganizers"
            description="Sent emails will have organizer's email as BCC."
            defaultChecked={event.emailNotifications?.sendToOrganizers}
          >
            Send notifications directly to organizer's emails
          </Checkbox>
        </Form>
      </section>
      <section>
        <H2 className="border-b border-gray-200 pb-3">Notifications</H2>
        <Form className="mt-6 space-y-4">
          <Checkbox
            id="emailNotifications.submitted"
            name="emailNotifications.submitted"
            description="Receive an email when a speaker submit a talk."
            defaultChecked={event.emailNotifications?.submitted}
          >
            Submitted proposals
          </Checkbox>
          <Checkbox
            id="emailNotifications.confirmed"
            name="emailNotifications.confirmed"
            description="Receive an email when a speaker confirm a talk."
            defaultChecked={event.emailNotifications?.confirmed}
          >
            Confirmed proposals
          </Checkbox>
          <Checkbox
            id="emailNotifications.declined"
            name="emailNotifications.declined"
            description="Receive an email when a speaker decline a talk."
            defaultChecked={event.emailNotifications?.declined}
          >
            Declined proposals
          </Checkbox>
          <Checkbox
            id="emailNotifications.accepted"
            name="emailNotifications.accepted"
            description="Have a copy of acceptation emails sent to speakers."
            defaultChecked={event.emailNotifications?.accepted}
          >
            Accepted proposals
          </Checkbox>
          <Checkbox
            id="emailNotifications.rejected"
            name="emailNotifications.rejected"
            description="Have a copy of rejection emails sent to speakers."
            defaultChecked={event.emailNotifications?.rejected}
          >
            Rejected proposals
          </Checkbox>
        </Form>
      </section>
    </>
  );
}
