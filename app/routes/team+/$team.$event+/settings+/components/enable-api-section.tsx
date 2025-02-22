import { Form } from 'react-router';

import { Button } from '~/design-system/buttons.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';

type Props = { apiKey: string | null };

export function EnableApiSection({ apiKey }: Props) {
  return (
    <Card as="section">
      <Card.Title>
        <H2>Web API</H2>
        <Subtitle>Use the HTTP API if you want to connect a service to some Conference Hall event.</Subtitle>
      </Card.Title>

      <Card.Content>
        <Form method="POST" id="api-integration-form" className="space-y-4">
          <Input
            name="apiKey"
            label="API key"
            disabled
            value={apiKey || ''}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          />
          <Callout title="Rate limit">
            The web API is limited to <strong>60 requests per hour</strong> maximum to avoid server overload by external
            services.
          </Callout>
        </Form>
      </Card.Content>

      <Card.Actions>
        <Button
          type="submit"
          name="intent"
          value={apiKey ? 'revoke-api-key' : 'generate-api-key'}
          form="api-integration-form"
        >
          {apiKey ? 'Revoke API key' : 'Generate API key'}
        </Button>
      </Card.Actions>
    </Card>
  );
}
