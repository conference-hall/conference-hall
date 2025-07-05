import { useId } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { Button } from '~/shared/design-system/buttons.tsx';
import { Callout } from '~/shared/design-system/callout.tsx';
import { Input } from '~/shared/design-system/forms/input.tsx';
import { Card } from '~/shared/design-system/layouts/card.tsx';
import { H2, Subtitle } from '~/shared/design-system/typography.tsx';

type Props = { apiKey: string | null };

export function EnableApiSection({ apiKey }: Props) {
  const { t } = useTranslation();
  const formId = useId();
  return (
    <Card as="section">
      <Card.Title>
        <H2>{t('event-management.settings.menu.web-api')}</H2>
        <Subtitle>{t('event-management.settings.web-api.description')}</Subtitle>
      </Card.Title>

      <Card.Content>
        <Form method="POST" id={formId} className="space-y-4">
          <Input
            name="apiKey"
            label={t('event-management.settings.web-api.api-key')}
            disabled
            value={apiKey || ''}
            placeholder={t('event-management.settings.web-api.api-key.placeholder')}
          />
          <Callout title="Rate limit">
            <Trans i18nKey="event-management.settings.web-api.info" components={[<strong key="1" />]} />
          </Callout>
        </Form>
      </Card.Content>

      <Card.Actions>
        <Button type="submit" name="intent" value={apiKey ? 'revoke-api-key' : 'generate-api-key'} form={formId}>
          {apiKey ? t('event-management.settings.web-api.revoke') : t('event-management.settings.web-api.generate')}
        </Button>
      </Card.Actions>
    </Card>
  );
}
