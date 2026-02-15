import { useTranslation } from 'react-i18next';
import { Form, useFetcher } from 'react-router';
import type { SubmissionErrors } from '~/shared/types/errors.types.ts';
import { Button } from '~/design-system/button.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { ToggleGroup } from '~/design-system/forms/toggles.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2 } from '~/design-system/typography.tsx';

type Props = {
  maxProposals: number | null;
  codeOfConductUrl: string | null;
  languageEnabled: boolean;
  errors: SubmissionErrors;
};

export function CommonCfpSetting({ maxProposals, codeOfConductUrl, languageEnabled, errors }: Props) {
  const { t } = useTranslation();
  const languageFetcher = useFetcher({ key: 'toggle-language-enabled' });

  const optimisticLanguageEnabled =
    languageFetcher.formData?.get('intent') === 'toggle-language-enabled'
      ? languageFetcher.formData.get('languageEnabled') === 'true'
      : languageEnabled;

  return (
    <>
      <Card as="section">
        <Card.Title>
          <H2>{t('event-management.settings.cfp.preferences.heading')}</H2>
        </Card.Title>

        <Form method="POST">
          <Card.Content>
            <Input
              name="maxProposals"
              label={t('event-management.settings.cfp.preferences.max-proposals.label')}
              description={t('event-management.settings.cfp.preferences.max-proposals.description')}
              type="number"
              defaultValue={maxProposals || ''}
              min={1}
              autoComplete="off"
              error={errors?.maxProposals}
            />
            <Input
              name="codeOfConductUrl"
              label={t('event-management.settings.cfp.preferences.coc-url.label')}
              description={t('event-management.settings.cfp.preferences.coc-url.description')}
              defaultValue={codeOfConductUrl || ''}
              error={errors?.codeOfConductUrl}
            />
          </Card.Content>

          <Card.Actions>
            <Button name="intent" value="save-cfp-preferences">
              {t('event-management.settings.cfp.preferences.submit')}
            </Button>
          </Card.Actions>
        </Form>
      </Card>

      <Card as="section" p={8} className="space-y-8">
        <ToggleGroup
          label={t('event-management.settings.cfp.preferences.language-enabled.label')}
          description={t('event-management.settings.cfp.preferences.language-enabled.description')}
          value={optimisticLanguageEnabled}
          onChange={(checked) =>
            languageFetcher.submit(
              { intent: 'toggle-language-enabled', languageEnabled: String(checked) },
              { method: 'POST' },
            )
          }
        />
      </Card>
    </>
  );
}
