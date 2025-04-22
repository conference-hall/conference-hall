import { Form, useFetcher } from 'react-router';
import { ToggleGroup } from '~/design-system/forms/toggles.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { formatTimezoneToUtc } from '~/libs/datetimes/timezone.ts';
import type { action } from '../cfp.tsx';

type Props = { cfpStart: Date | null; timezone: string };

export function MeetupCfpOpening({ cfpStart, timezone }: Props) {
  const fetcher = useFetcher<typeof action>();

  const handleChange = (checked: boolean) => {
    fetcher.submit(
      {
        intent: 'save-cfp-meetup-opening',
        cfpStart: checked ? formatTimezoneToUtc(new Date(), timezone) : '',
      },
      { method: 'POST' },
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
            label="Call for paper activation"
            description="Enable the call for paper for this meetup."
            value={Boolean(cfpStart)}
            onChange={handleChange}
          />
        </Card.Content>
      </Form>
    </Card>
  );
}
