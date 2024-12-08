import { Form } from 'react-router';

import { BadgeDot } from '~/design-system/badges.tsx';
import { Button } from '~/design-system/buttons.tsx';
import { Checkbox } from '~/design-system/forms/checkboxes.tsx';
import { H2 } from '~/design-system/typography.tsx';
import type { DeliberationStatus, PublicationStatus } from '~/types/proposals.types';

type Props = { deliberationStatus: DeliberationStatus; publicationStatus: PublicationStatus };

export function PublicationDetails({ deliberationStatus, publicationStatus }: Props) {
  if (deliberationStatus === 'PENDING') return null;
  if (deliberationStatus === 'ACCEPTED' && publicationStatus === 'PUBLISHED') return null;

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <H2 size="s">Publication</H2>
      <PublicationLabel deliberationStatus={deliberationStatus} publicationStatus={publicationStatus} />
    </div>
  );
}

function PublicationLabel({ publicationStatus }: Props) {
  if (publicationStatus === 'PUBLISHED') {
    return <BadgeDot color="green">Result published to speakers</BadgeDot>;
  } else if (publicationStatus === 'NOT_PUBLISHED') {
    return (
      <Form method="POST" className="space-y-4">
        <BadgeDot color="gray">Result not published to speakers</BadgeDot>
        <Checkbox id="send-email" name="send-email">
          Notify speakers via email
        </Checkbox>
        <Button type="submit" name="intent" value="publish-results" variant="secondary" block>
          Publish result to speakers
        </Button>
      </Form>
    );
  }
}
