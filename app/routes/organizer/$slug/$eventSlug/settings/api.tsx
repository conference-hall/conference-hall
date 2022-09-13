import type { LoaderArgs } from '@remix-run/node';
import { sessionRequired } from '~/services/auth/auth.server';
import { H2, Text } from '~/design-system/Typography';
import { Form } from '@remix-run/react';
import { ExternalLink } from '~/design-system/Links';
import { Button } from '~/design-system/Buttons';
import { Input } from '~/design-system/forms/Input';
import { useState } from 'react';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return null;
};

export default function EventApiSettingsRoute() {
  const [enabled, setEnabled] = useState(false);
  return (
    <>
      <section>
        <div className="flex items-end justify-between border-b border-gray-200 pb-3">
          <H2>Web API</H2>
          <Button size="s" onClick={() => setEnabled(!enabled)}>
            {enabled ? 'Disable Web API' : 'Enable Web API'}
          </Button>
        </div>
        <Text variant="secondary" className="mt-6">
          Use the HTTP API if you want to connect a service to some Conference Hall event. Have a look at the Conference
          Hall <ExternalLink href="https://contribute-conference-hall.netlify.com/">API documentation</ExternalLink>.
        </Text>

        <Form className="mt-6 space-y-4">
          <div className="flex items-end gap-2">
            <Input name="apiKey" label="API key" disabled required className="grow" />
            <Button disabled={!enabled} variant="secondary">
              Generate API Key
            </Button>
          </div>
        </Form>
      </section>
    </>
  );
}
