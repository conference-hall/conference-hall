import invariant from 'tiny-invariant';
import type { ChangeEvent } from 'react';
import type { LoaderArgs } from '@remix-run/node';
import { sessionRequired } from '~/libs/auth/auth.server';
import { H2, Text } from '~/design-system/Typography';
import { Checkbox } from '~/design-system/forms/Checkboxes';
import { Form, useOutletContext, useSubmit } from '@remix-run/react';
import { Button } from '~/design-system/Buttons';
import type { OrganizerEventContext } from '../organizer.$orga.$event/route';
import { withZod } from '@remix-validated-form/with-zod';
import { EventReviewSettingsSchema } from '~/schemas/event';
import { updateEvent } from '~/shared-server/organizations/update-event.server';

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
    case 'enable-review': {
      await updateEvent(params.orga, params.event, uid, {
        deliberationEnabled: form.get('deliberationEnabled') === 'true',
      });
      break;
    }
    case 'save-review-settings': {
      const result = await withZod(EventReviewSettingsSchema).validate(form);
      if (!result.error) await updateEvent(params.orga, params.event, uid, result.data);
      break;
    }
  }
  return null;
};

export default function EventReviewSettingsRoute() {
  const { event } = useOutletContext<OrganizerEventContext>();

  const submit = useSubmit();

  function handleChange(event: ChangeEvent<HTMLFormElement>) {
    submit(event.currentTarget);
  }

  return (
    <>
      <section>
        <H2 className="border-b border-gray-200 pb-3">Proposals review</H2>
        <Form method="post" className="mt-6 space-y-4">
          <Text variant="secondary">
            Enable or disabled proposal review. When disabled, reviewers won't be able to review proposals anymore.
          </Text>
          <input type="hidden" name="_action" value="enable-review" />
          <input type="hidden" name="deliberationEnabled" value={String(!event.deliberationEnabled)} />
          {event.deliberationEnabled ? (
            <Button type="submit">Disable proposal review</Button>
          ) : (
            <Button type="submit">Enable proposal review</Button>
          )}
        </Form>
      </section>
      <section>
        <H2 className="border-b border-gray-200 pb-3">Review settings</H2>
        <Form method="post" onChange={handleChange} className="mt-6 space-y-4">
          <input type="hidden" name="_action" value="save-review-settings" />
          <Checkbox
            id="displayOrganizersRatings"
            name="displayOrganizersRatings"
            defaultChecked={event.displayOrganizersRatings}
            description="When disabled, organizer ratings won't be visible in the review page."
          >
            Display organizers ratings
          </Checkbox>
          <Checkbox
            id="displayProposalsRatings"
            name="displayProposalsRatings"
            defaultChecked={event.displayProposalsRatings}
            description="When disabled, proposal global ratings won't be visibile in the proposals list."
          >
            Display ratings in proposal list
          </Checkbox>
          <Checkbox
            id="displayProposalsSpeakers"
            name="displayProposalsSpeakers"
            defaultChecked={event.displayProposalsSpeakers}
            description="When disabled, all speakers information are not visible in proposal list and review page. Used for anonymized reviews."
          >
            Display speakers in proposal page
          </Checkbox>
        </Form>
      </section>
    </>
  );
}
