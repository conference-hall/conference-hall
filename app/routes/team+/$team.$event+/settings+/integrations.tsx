import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { UserEvent } from '~/.server/organizer-event-settings/UserEvent.ts';
import { EventSlackSettingsSchema } from '~/.server/organizer-event-settings/UserEvent.types.ts';
import { AlertInfo } from '~/design-system/Alerts.tsx';
import { Button } from '~/design-system/Buttons.tsx';
import { Input } from '~/design-system/forms/Input.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { ExternalLink } from '~/design-system/Links.tsx';
import { H2 } from '~/design-system/Typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { parseWithZod } from '~/libs/zod-parser.ts';

import { useEvent } from '../__components/useEvent.tsx';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');
  const event = UserEvent.for(userId, params.team, params.event);

  const form = await request.formData();
  const result = parseWithZod(form, EventSlackSettingsSchema);
  if (!result.success) return json(result.error);

  await event.update(result.value);
  return json(null);
};

export default function EventIntegrationsSettingsRoute() {
  const { event } = useEvent();
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
