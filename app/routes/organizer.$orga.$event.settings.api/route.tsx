import invariant from 'tiny-invariant';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { v4 as uuid } from 'uuid';
import { requireSession } from '~/libs/auth/cookies';
import { H2, Text } from '~/design-system/Typography';
import { Form } from '@remix-run/react';
import { ExternalLink } from '~/design-system/Links';
import { Button } from '~/design-system/Buttons';
import { Input } from '~/design-system/forms/Input';
import { updateEvent } from '~/shared-server/organizations/update-event.server';
import { useOrganizerEvent } from '../organizer.$orga.$event/route';

export const loader = async ({ request }: LoaderArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: ActionArgs) => {
  const { uid } = await requireSession(request);
  invariant(params.orga, 'Invalid organization slug');
  invariant(params.event, 'Invalid event slug');
  const form = await request.formData();
  const action = form.get('_action');

  switch (action) {
    case 'revoke-api-key': {
      await updateEvent(params.orga, params.event, uid, { apiKey: null });
      break;
    }
    case 'generate-api-key': {
      await updateEvent(params.orga, params.event, uid, { apiKey: uuid() });
      break;
    }
  }
  return null;
};

export default function EventApiSettingsRoute() {
  const { event } = useOrganizerEvent();

  return (
    <>
      <section>
        <H2>Web API</H2>
        <Text variant="secondary">
          Use the HTTP API if you want to connect a service to some Conference Hall event. Have a look at the Conference
          Hall <ExternalLink href="https://contribute-conference-hall.netlify.com/">API documentation</ExternalLink>.
        </Text>

        <Form method="POST" className="mt-6 space-y-4">
          <Input name="apiKey" label="API key" disabled value={event.apiKey || ''} />
          {event.apiKey ? (
            <input type="hidden" name="_action" value="revoke-api-key" />
          ) : (
            <input type="hidden" name="_action" value="generate-api-key" />
          )}
          <Button type="submit" variant="secondary">
            {event.apiKey ? 'Revoke API key' : 'Generate API key'}
          </Button>
        </Form>
      </section>
    </>
  );
}
