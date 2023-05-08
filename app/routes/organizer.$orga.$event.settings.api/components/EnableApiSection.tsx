import { Form } from '@remix-run/react';
import { Button } from '~/design-system/Buttons';
import { H2, Subtitle } from '~/design-system/Typography';
import { Input } from '~/design-system/forms/Input';
import { Card } from '~/design-system/layouts/Card';

type Props = { apiKey: string | null };

export function EnableApiSection({ apiKey }: Props) {
  return (
    <Card as="section">
      <Card.Title>
        <H2 size="xl">Web API</H2>
        <Subtitle>Use the HTTP API if you want to connect a service to some Conference Hall event.</Subtitle>
      </Card.Title>

      <Card.Content>
        <Form method="POST" id="api-integration-form">
          {apiKey ? (
            <input type="hidden" name="_action" value="revoke-api-key" />
          ) : (
            <input type="hidden" name="_action" value="generate-api-key" />
          )}
          <Input
            name="apiKey"
            label="API key"
            disabled
            value={apiKey || ''}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          />
        </Form>
      </Card.Content>

      <Card.Actions>
        <Button type="submit" form="api-integration-form">
          {apiKey ? 'Revoke API key' : 'Generate API key'}
        </Button>
      </Card.Actions>
    </Card>
  );
}
