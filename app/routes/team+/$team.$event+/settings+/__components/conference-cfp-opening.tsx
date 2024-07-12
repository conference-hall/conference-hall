import { Form } from '@remix-run/react';

import { Button } from '~/design-system/buttons.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { DateRangeInput } from '~/design-system/forms/date-range-input.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2 } from '~/design-system/typography.tsx';

type Props = {
  cfpStart?: string;
  cfpEnd?: string;
  timezone: string;
  errors?: Record<string, string | string[]> | null;
};

export function ConferenceCfpOpening({ cfpStart, cfpEnd, timezone, errors }: Props) {
  return (
    <Card as="section">
      <Card.Title>
        <H2>Call for paper opening</H2>
      </Card.Title>

      <Form method="POST">
        <Card.Content>
          <div className="space-y-4">
            <DateRangeInput
              start={{ name: 'cfpStart', label: 'Opening date', value: cfpStart }}
              end={{ name: 'cfpEnd', label: 'Closing date', value: cfpEnd }}
              timezone={timezone}
              error={errors?.cfpStart}
            />
            <Callout title="Call for Papers period">
              Specify the period during which the call for papers will be open. The CFP will automatically open and
              close based on these dates and times.
            </Callout>
            <input type="hidden" name="timezone" value={timezone} />
          </div>
        </Card.Content>
        <Card.Actions>
          <Button name="intent" value="save-cfp-conference-opening">
            Save CFP openings
          </Button>
        </Card.Actions>
      </Form>
    </Card>
  );
}
