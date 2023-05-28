import { Form, useFetcher } from '@remix-run/react';

import { ToggleGroup } from '~/design-system/forms/Toggles';
import { Card } from '~/design-system/layouts/Card';
import { H2 } from '~/design-system/Typography';

type Props = { cfpStart?: string };

export function MeetupCfpOpening({ cfpStart }: Props) {
  const fetcher = useFetcher();

  const handleChange = (checked: boolean) => {
    fetcher.submit(
      { intent: 'save-cfp-meetup-opening', cfpStart: checked ? new Date().toISOString() : '' },
      { method: 'POST' }
    );
  };

  return (
    <Card as="section">
      <Card.Title>
        <H2>Call for paper opening</H2>
      </Card.Title>

      <Form method="POST">
        <Card.Content>
          <ToggleGroup
            label="Call for paper open"
            description="Enable the call for paper for this meetup."
            value={Boolean(cfpStart)}
            onChange={handleChange}
          />
        </Card.Content>
      </Form>
    </Card>
  );
}