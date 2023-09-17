import { parse } from '@conform-to/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { AlertInfo } from '~/design-system/Alerts.tsx';
import { Button } from '~/design-system/Buttons.tsx';
import { Input } from '~/design-system/forms/Input.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { ExternalLink } from '~/design-system/Links.tsx';
import { H2 } from '~/design-system/Typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { updateEvent } from '~/routes/__server/teams/update-event.server.ts';

import { useOrganizerEvent } from '../_layout.tsx';
import { EventSlackSettingsSchema } from './__types/event-slack-settings.schema.ts';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  const form = await request.formData();

  const result = parse(form, { schema: EventSlackSettingsSchema });
  if (!result.value) return json(result.error);

  await updateEvent(params.event, userId, result.value);
  return json(null);
};

export default function EventIntegrationsSettingsRoute() {
  const { event } = useOrganizerEvent();
  const errors = useActionData<typeof action>();

  return (
    <Card as="section">
      <Card.Title>
        <H2>Slack integration</H2>
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
          <ExternalLink href="https://api.slack.com/incoming-webhooks" variant="secondary">
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
