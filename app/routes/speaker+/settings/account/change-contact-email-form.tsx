import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { Button } from '~/design-system/buttons.tsx';
import { type Option, SelectNative } from '~/design-system/forms/select-native.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';
import { getClientAuth } from '~/libs/auth/firebase.ts';

type Props = { email: string; authLoaded: boolean };

export function ChangeContactEmailForm({ email, authLoaded }: Props) {
  const { t } = useTranslation();
  const providers = getClientAuth().currentUser?.providerData ?? [];

  const options: Array<Option> = [];
  if (!providers.length) {
    options.push({ name: email, value: email });
  } else {
    for (const provider of providers) {
      if (provider.email === null) continue;
      if (options.some((option) => option.value === provider.email)) continue;
      options.push({ name: provider.email, value: provider.email });
    }
  }

  return (
    <Card as="section">
      <Card.Title>
        <H2>{t('settings.account.contact.heading')}</H2>
        <Subtitle>t('settings.account.contact.description')</Subtitle>
      </Card.Title>

      <Card.Content>
        <Form id="change-contact-email-form" method="POST" preventScrollReset>
          <SelectNative
            name="email"
            key={email}
            label={t('common.email')}
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
          {t('settings.account.contact.submit')}
        </Button>
      </Card.Actions>
    </Card>
  );
}
