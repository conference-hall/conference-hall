import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { Callout } from '~/design-system/callout.tsx';
import { DateRangeInput } from '~/design-system/forms/date-range-input.tsx';
import { utcToTimezone } from '~/shared/datetimes/timezone.ts';
import type { SubmissionErrors } from '~/shared/types/errors.types.ts';

type Props = {
  formId: string;
  timezone: string;
  cfpStart: Date | null;
  cfpEnd: Date | null;
  errors: SubmissionErrors;
};

export function EventCfpConferenceForm({ formId, timezone, cfpStart, cfpEnd, errors }: Props) {
  const { t } = useTranslation();
  return (
    <Form id={formId} method="POST">
      <div className="space-y-4">
        <DateRangeInput
          start={{
            name: 'cfpStart',
            label: t('event-management.fields.cfp-start'),
            value: cfpStart ? utcToTimezone(cfpStart, timezone) : null,
          }}
          end={{
            name: 'cfpEnd',
            label: t('event-management.fields.cfp-end'),
            value: cfpEnd ? utcToTimezone(cfpEnd, timezone) : null,
          }}
          error={errors?.cfpStart}
        />
        <Callout title={t('event-management.fields.cfp-dates.heading')}>
          {t('event-management.fields.cfp-dates.description')}
        </Callout>
        <input type="hidden" name="timezone" value={timezone} />
      </div>
    </Form>
  );
}
