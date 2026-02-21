import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '~/design-system/button.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { EventCfpConferenceForm } from '~/features/event-management/creation/components/event-cfp-conference-form.tsx';
import type { SubmissionErrors } from '~/shared/types/errors.types.ts';

type Props = {
  cfpStart: Date | null;
  cfpEnd: Date | null;
  timezone: string;
  errors: SubmissionErrors;
};

export function ConferenceCfpOpening({ cfpStart, cfpEnd, timezone, errors }: Props) {
  const { t } = useTranslation();
  const formId = useId();
  return (
    <Card as="section">
      <Card.Title>
        <H2>{t('event-management.settings.cfp.openings.heading')}</H2>
      </Card.Title>

      <Card.Content>
        <EventCfpConferenceForm
          formId={formId}
          cfpStart={cfpStart}
          cfpEnd={cfpEnd}
          timezone={timezone}
          errors={errors}
        />
      </Card.Content>
      <Card.Actions>
        <Button name="intent" value="save-cfp-conference-opening" form={formId}>
          {t('event-management.settings.cfp.openings.submit')}
        </Button>
      </Card.Actions>
    </Card>
  );
}
