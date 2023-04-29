import invariant from 'tiny-invariant';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { v4 as uuid } from 'uuid';
import { requireSession } from '~/libs/auth/session';
import { H2 } from '~/design-system/Typography';
import { Form } from '@remix-run/react';
import { ExternalLink } from '~/design-system/Links';
import { Button } from '~/design-system/Buttons';
import { Input } from '~/design-system/forms/Input';
import { updateEvent } from '~/shared-server/organizations/update-event.server';
import { useOrganizerEvent } from '../organizer.$orga.$event/route';
import { Card } from '~/design-system/layouts/Card';
import { AlertInfo } from '~/design-system/Alerts';

export const loader = async ({ request }: LoaderArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await requireSession(request);
  invariant(params.orga, 'Invalid organization slug');
  invariant(params.event, 'Invalid event slug');
  const form = await request.formData();
  const action = form.get('_action');

  switch (action) {
    case 'revoke-api-key': {
      await updateEvent(params.orga, params.event, userId, { apiKey: null });
      break;
    }
    case 'generate-api-key': {
      await updateEvent(params.orga, params.event, userId, { apiKey: uuid() });
      break;
    }
  }
  return null;
};

export default function EventApiSettingsRoute() {
  const { event } = useOrganizerEvent();

  return (
    <Card as="section">
      <Card.Title>
        <H2 size="xl">Web API</H2>
      </Card.Title>

      <Card.Content>
        <Form method="POST" id="api-integration-form">
          {event.apiKey ? (
            <input type="hidden" name="_action" value="revoke-api-key" />
          ) : (
            <input type="hidden" name="_action" value="generate-api-key" />
          )}
          <Input
            name="apiKey"
            label="API key"
            disabled
            value={event.apiKey || ''}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          />
        </Form>

        <AlertInfo>
          Use the HTTP API if you want to connect a service to some Conference Hall event. Have a look at the Conference
          Hall{' '}
          <ExternalLink href="https://contribute-conference-hall.netlify.com/" className="underline">
            API documentation
          </ExternalLink>
          .
        </AlertInfo>
      </Card.Content>

      <Card.Actions>
        <Button type="submit" form="api-integration-form">
          {event.apiKey ? 'Revoke API key' : 'Generate API key'}
        </Button>
      </Card.Actions>
    </Card>
  );
}
