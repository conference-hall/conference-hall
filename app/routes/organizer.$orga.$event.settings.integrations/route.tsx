import invariant from 'tiny-invariant';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { requireSession } from '~/libs/auth/session';
import { H2 } from '~/design-system/Typography';
import { ExternalLink } from '~/design-system/Links';
import { Button } from '~/design-system/Buttons';
import { Input } from '~/design-system/forms/Input';
import { updateEvent } from '~/shared-server/organizations/update-event.server';
import { EventSlackSettingsSchema } from './types/event-slack-settings.schema';
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

  const result = await withZod(EventSlackSettingsSchema).validate(form);
  if (result.error) return json(result.error.fieldErrors);
  await updateEvent(params.orga, params.event, uid, result.data);
  return json(null);
};

export default function EventIntegrationsSettingsRoute() {
  const { event } = useOrganizerEvent();
  const errors = useActionData<typeof action>();

  return (
    <Card as="section">
      <Card.Title>
        <H2 size="xl">Slack integration</H2>
      </Card.Title>

      <Card.Content>
        <Form method="POST" id="slack-integration-form">
          <Input
            name="slackWebhookUrl"
            label="Slack web hook URL"
            placeholder="https://hooks.slack.com/services/xxx-yyy-zzz"
            defaultValue={event.slackWebhookUrl || ''}
            error={errors?.slackWebhookUrl}
          />
        </Form>
        <AlertInfo>
          With Slack integration you will be able to received notifications about speakers in a dedicated Slack channel.
          Follow the 3 steps of the{' '}
          <ExternalLink href="https://api.slack.com/incoming-webhooks" className="underline">
            Slack documentation
          </ExternalLink>{' '}
          to get the Incoming Web Hook URL and choose the channel.
        </AlertInfo>
      </Card.Content>

      <Card.Actions>
        <Button type="submit" form="slack-integration-form">
          Save Slack integration
        </Button>
      </Card.Actions>
    </Card>
  );
}
