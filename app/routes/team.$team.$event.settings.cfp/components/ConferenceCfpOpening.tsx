import { Form } from '@remix-run/react';

import { AlertInfo } from '~/design-system/Alerts';
import { Button } from '~/design-system/Buttons';
import { DateRangeInput } from '~/design-system/forms/DateRangeInput';
import { Card } from '~/design-system/layouts/Card';
import { H2 } from '~/design-system/Typography';

type Props = { cfpStart?: string; cfpEnd?: string; errors?: Record<string, string | string[]> | null };

export function ConferenceCfpOpening({ cfpStart, cfpEnd, errors }: Props) {
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
              error={errors?.cfpStart}
            />
            <AlertInfo>
              Define the period during which the call for papers should be open. The opening and closing of the CFP will
              be done automatically according to these dates and times.
            </AlertInfo>
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
