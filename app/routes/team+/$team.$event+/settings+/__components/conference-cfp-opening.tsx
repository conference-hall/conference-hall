import { Button } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { EventCfpConferenceForm } from '~/routes/__components/events/event-cfp-conference-form.tsx';
import type { SubmissionErrors } from '~/types/errors.types.ts';

type Props = {
  cfpStart: Date | null;
  cfpEnd: Date | null;
  timezone: string;
  errors: SubmissionErrors;
};

export function ConferenceCfpOpening({ cfpStart, cfpEnd, timezone, errors }: Props) {
  return (
    <Card as="section">
      <Card.Title>
        <H2>Call for paper opening</H2>
      </Card.Title>

      <Card.Content>
        <EventCfpConferenceForm cfpStart={cfpStart} cfpEnd={cfpEnd} timezone={timezone} errors={errors} />
      </Card.Content>
      <Card.Actions>
        <Button name="intent" value="save-cfp-conference-opening" form="cfp-conference-form">
          Save CFP openings
        </Button>
      </Card.Actions>
    </Card>
  );
}
