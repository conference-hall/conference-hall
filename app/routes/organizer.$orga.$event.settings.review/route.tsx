import invariant from 'tiny-invariant';
import type { ChangeEvent } from 'react';
import type { LoaderArgs } from '@remix-run/node';
import { requireSession } from '~/libs/auth/session';
import { H2 } from '~/design-system/Typography';
import { Checkbox } from '~/design-system/forms/Checkboxes';
import { Form, useSubmit } from '@remix-run/react';
import { Button } from '~/design-system/Buttons';
import { withZod } from '@remix-validated-form/with-zod';
import { updateEvent } from '~/shared-server/organizations/update-event.server';
import { EventReviewSettingsSchema } from './types/event-review-settings.schema';
import { useOrganizerEvent } from '../organizer.$orga.$event/route';
import { Card } from '~/design-system/layouts/Card';
import { AlertInfo } from '~/design-system/Alerts';

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
  const { event } = useOrganizerEvent();

  const submit = useSubmit();

  function handleChange(event: ChangeEvent<HTMLFormElement>) {
    submit(event.currentTarget);
  }

  return (
    <>
      <Card as="section">
        <Card.Title>
          <H2 size="xl">Proposals review</H2>
        </Card.Title>
        <Card.Content>
          <AlertInfo>
            Enable or disabled proposal review. When disabled, reviewers won't be able to review proposals anymore.
          </AlertInfo>
        </Card.Content>
        <Card.Actions>
          <Form method="POST">
            <input type="hidden" name="_action" value="enable-review" />
            <input type="hidden" name="deliberationEnabled" value={String(!event.deliberationEnabled)} />
            {event.deliberationEnabled ? (
              <Button type="submit">Disable proposal review</Button>
            ) : (
              <Button type="submit">Enable proposal review</Button>
            )}
          </Form>
        </Card.Actions>
      </Card>

      <Card as="section">
        <Card.Title>
          <H2 size="xl">Review settings</H2>
        </Card.Title>

        <Card.Content>
          <Form method="POST" onChange={handleChange} className="space-y-4">
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
              description="When disabled, proposal global ratings won't be visible in the proposals list."
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
            <input type="hidden" name="_action" value="save-review-settings" />
          </Form>
        </Card.Content>
      </Card>
    </>
  );
}
