import type { LoaderArgs } from '@remix-run/node';
import { sessionRequired } from '~/services/auth/auth.server';
import { H2 } from '~/design-system/Typography';
import { Checkbox } from '~/design-system/forms/Checkboxes';
import { Form } from '@remix-run/react';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return null;
};

export default function EventNotificationsSettingsRoute() {
  return (
    <>
      <section>
        <H2 className="border-b border-gray-200 pb-3">Email notifications</H2>
        <Form className="mt-6 space-y-4">
          <Checkbox
            id="hideOrganizersRatings"
            name="hideOrganizersRatings"
            description="Sent emails will have the event contact email as CC."
          >
            Send to the event contact email
          </Checkbox>
          <Checkbox
            id="hideProposalsRatings"
            name="hideProposalsRatings"
            description="Sent emails will have organizer's email as BCC."
          >
            Send to organizer's emails
          </Checkbox>
        </Form>
      </section>
      <section>
        <H2 className="border-b border-gray-200 pb-3">Notifications</H2>
        <Form className="mt-6 space-y-4">
          <Checkbox
            id="notifications.submitted"
            name="notifications.submitted"
            description="Receive an email when a speaker submit a talk."
          >
            Submitted proposals
          </Checkbox>
          <Checkbox
            id="notifications.confirmed"
            name="notifications.confirmed"
            description="Receive an email when a speaker confirm a talk."
          >
            Confirmed proposals
          </Checkbox>
          <Checkbox
            id="notifications.declined"
            name="notifications.declined"
            description="Receive an email when a speaker decline a talk."
          >
            Declined proposals
          </Checkbox>
          <Checkbox
            id="notifications.accepted"
            name="notifications.accepted"
            description="Have a copy of acceptation emails sent to speakers."
          >
            Accepted proposals
          </Checkbox>
          <Checkbox
            id="notifications.rejected"
            name="notifications.rejected"
            description="Have a copy of rejection emails sent to speakers."
          >
            Rejected proposals
          </Checkbox>
        </Form>
      </section>
    </>
  );
}
