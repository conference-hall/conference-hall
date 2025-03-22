import { Form } from 'react-router';
import { Button } from '~/design-system/buttons.tsx';
import { type Option, SelectNative } from '~/design-system/forms/select-native.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';
import { getClientAuth } from '~/libs/auth/firebase.ts';

type Props = { email: string; authLoaded: boolean };

export function ChangeContactEmailForm({ email, authLoaded }: Props) {
  const providers = getClientAuth().currentUser?.providerData ?? [];

  const options: Array<Option> = [];
  for (const provider of providers) {
    if (provider.email === null) continue;
    if (options.some((option) => option.value === provider.email)) continue;
    options.push({ name: provider.email, value: provider.email });
  }

  return (
    <Card as="section">
      <Card.Title>
        <H2>Contact email</H2>
        <Subtitle>Email address used for account notifications and communication with events organizers.</Subtitle>
      </Card.Title>

      <Card.Content>
        <Form id="change-contact-email-form" method="POST" preventScrollReset>
          <SelectNative
            name="email"
            key={email}
            label="Email address"
            defaultValue={email || ''}
            options={options}
            disabled={!authLoaded}
          />
        </Form>
      </Card.Content>

      <Card.Actions>
        <Button
          type="submit"
          name="intent"
          value="change-contact-email"
          form="change-contact-email-form"
          disabled={!authLoaded}
        >
          Save contact email
        </Button>
      </Card.Actions>
    </Card>
  );
}
