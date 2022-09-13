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

export default function EventIntegrationsSettingsRoute() {
  const [enabled, setEnabled] = useState(false);
  return (
    <>
      <section>
        <div className="flex items-end justify-between border-b border-gray-200 pb-3">
          <H2>Slack integration</H2>
          <Button size="s" onClick={() => setEnabled(!enabled)}>
            {enabled ? 'Disable Slack' : 'Enable Slack'}
          </Button>
        </div>
        <Text variant="secondary" className="mt-6">
          With Slack integration you will be able to received notifications about speakers in a dedicated Slack channel.
          Follow the 3 steps of the{' '}
          <ExternalLink href="https://api.slack.com/incoming-webhooks">Slack documentation</ExternalLink> to get the
          Incoming Web Hook URL and choose the channel.
        </Text>

        <Form className="mt-6 space-y-4">
          <div className="flex items-end gap-2">
            <Input name="webhookURL" label="Web hook URL" disabled={!enabled} required className="grow" />
            <Button disabled={!enabled} variant="secondary">
              Save Web hook URL
            </Button>
          </div>
        </Form>
      </section>
    </>
  );
}
