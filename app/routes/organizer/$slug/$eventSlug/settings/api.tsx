import type { LoaderArgs } from '@remix-run/node';
import { sessionRequired } from '~/services/auth/auth.server';
import { H2, Text } from '~/design-system/Typography';
import { Form, useOutletContext } from '@remix-run/react';
import { ExternalLink } from '~/design-system/Links';
import { Button } from '~/design-system/Buttons';
import { Input } from '~/design-system/forms/Input';
import type { OrganizerEventContext } from '../../$eventSlug';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
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

        <Form className="mt-6 space-y-4">
          <Input name="apiKey" label="API key" disabled defaultValue={event.apiKey || ''} />
          {event.apiKey ? (
            <Button disabled variant="secondary">
              Revoke API key
            </Button>
          ) : (
            <Button variant="primary">Generate API Key</Button>
          )}
        </Form>
      </section>
    </>
  );
}
