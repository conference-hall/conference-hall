import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { Button } from '~/design-system/buttons.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2 } from '~/design-system/typography.tsx';
import type { SubmissionErrors } from '~/shared/types/errors.types.ts';

type Props = {
  maxProposals: number | null;
  codeOfConductUrl: string | null;
  errors: SubmissionErrors;
};

export function CommonCfpSetting({ maxProposals, codeOfConductUrl, errors }: Props) {
  const { t } = useTranslation();
  return (
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
  );
}
