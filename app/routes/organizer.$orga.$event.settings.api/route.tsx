import invariant from 'tiny-invariant';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { v4 as uuid } from 'uuid';
import { sessionRequired } from '~/libs/auth/auth.server';
import { H2, Text } from '~/design-system/Typography';
import { Form, useOutletContext } from '@remix-run/react';
import { ExternalLink } from '~/design-system/Links';
import { Button } from '~/design-system/Buttons';
import { Input } from '~/design-system/forms/Input';
import type { OrganizerEventContext } from '../organizer.$orga.$event/route';
import { updateEvent } from '~/shared-server/organizations/update-event.server';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return null;
};

export const action = async ({ request, params }: ActionArgs) => {
  const { uid } = await sessionRequired(request);
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
  const { event } = useOutletContext<OrganizerEventContext>();
  return (
    <>
      <section>
        <H2 className="border-b border-gray-200 pb-3">Web API</H2>
        <Text variant="secondary" className="mt-6">
          Use the HTTP API if you want to connect a service to some Conference Hall event. Have a look at the Conference
          Hall <ExternalLink href="https://contribute-conference-hall.netlify.com/">API documentation</ExternalLink>.
        </Text>

        <Form method="post" className="mt-6 space-y-4">
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
