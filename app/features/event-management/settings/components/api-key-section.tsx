import { SparklesIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useId } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';
import { useFlag } from '~/shared/feature-flags/flags-context.tsx';

type Props = { apiKey: string | null };

export function ApiKeySection({ apiKey }: Props) {
  const { t } = useTranslation();
  const formId = useId();
  const disableApiKeyInQueryParams = useFlag('disableApiKeyInQueryParams');

  return (
    <Card as="section">
      <Card.Title>
        <H2>{t('event-management.settings.menu.web-api')}</H2>
        <Subtitle>{t('event-management.settings.web-api.description')}</Subtitle>
      </Card.Title>

      <Card.Content>
        <Form method="POST" id={formId} className="space-y-8">
          <Input
            name="apiKey"
            disabled
            value={apiKey || ''}
            addon="X-API-Key:&nbsp;&nbsp;"
            label={t('event-management.settings.web-api.api-key')}
            placeholder={t('event-management.settings.web-api.api-key.placeholder')}
            description={t('event-management.settings.web-api.api-key.description')}
          />

          <section className="space-y-6">
            <Callout title={t('event-management.settings.web-api.rate-limit.title')}>
              <Trans
                i18nKey="event-management.settings.web-api.rate-limit.description"
                components={[<strong key="1" />]}
              />
            </Callout>

            {apiKey && !disableApiKeyInQueryParams ? (
              <Callout variant="warning" title={t('event-management.settings.web-api.deprecation.title')}>
                {t('event-management.settings.web-api.deprecation.description')}
              </Callout>
            ) : null}
          </section>
        </Form>
      </Card.Content>

      <Card.Actions>
        <Button
          type="submit"
          name="intent"
          value={apiKey ? 'revoke-api-key' : 'generate-api-key'}
          iconLeft={apiKey ? TrashIcon : SparklesIcon}
          variant={apiKey ? 'important' : 'primary'}
          form={formId}
        >
          {apiKey ? t('event-management.settings.web-api.revoke') : t('event-management.settings.web-api.generate')}
        </Button>
      </Card.Actions>
    </Card>
  );
}
