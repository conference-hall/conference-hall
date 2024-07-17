import { Form } from '@remix-run/react';

import { Callout } from '~/design-system/callout.tsx';
import { DateRangeInput } from '~/design-system/forms/date-range-input.tsx';
import type { SubmissionErrors } from '~/types/errors.types.ts';

type Props = {
  timezone: string;
  cfpStart: string | undefined;
  cfpEnd: string | undefined;
  errors: SubmissionErrors;
};

export function EventCfpConferenceForm({ timezone, cfpStart, cfpEnd, errors }: Props) {
  return (
    <Form id="cfp-conference-form" method="POST">
      <div className="space-y-4">
        <DateRangeInput
          start={{ name: 'cfpStart', label: 'Opening date', value: cfpStart }}
          end={{ name: 'cfpEnd', label: 'Closing date', value: cfpEnd }}
          timezone={timezone}
          error={errors?.cfpStart}
        />
        <Callout title="Call for Papers period">
          Specify the period during which the call for papers will be open. The CFP will automatically open and close
          based on these dates and times.
        </Callout>
        <input type="hidden" name="timezone" value={timezone} />
      </div>
    </Form>
  );
}
