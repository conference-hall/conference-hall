import { RocketLaunchIcon } from '@heroicons/react/24/outline';
import { Form } from '@remix-run/react';

import { Button } from '~/design-system/Buttons';
import { Checkbox } from '~/design-system/forms/Checkboxes';
import { H2, Text } from '~/design-system/Typography';
import type { DeliberationStatus, PublicationStatus } from '~/types/proposals.types';

type Props = { deliberationStatus: DeliberationStatus; publicationStatus: PublicationStatus };

export function PublicationDetails({ deliberationStatus, publicationStatus }: Props) {
  if (deliberationStatus === 'PENDING') return null;
  if (deliberationStatus === 'ACCEPTED' && publicationStatus === 'PUBLISHED') return null;

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <H2 size="s">Publication</H2>
      </div>
      <PublicationLabel deliberationStatus={deliberationStatus} publicationStatus={publicationStatus} />
    </div>
  );
}

function PublicationLabel({ publicationStatus }: Props) {
  if (publicationStatus === 'PUBLISHED') {
    return (
      <Text variant="secondary">
        <RocketLaunchIcon className="w-5 h-5 mr-2 mb-0.5 inline-block text-gray-600" />
        Result published to speakers
      </Text>
    );
  } else if (publicationStatus === 'NOT_PUBLISHED') {
    return (
      <Form method="POST" className="flex flex-col gap-4">
        <input type="hidden" name="intent" value="publish-results" />
        <Text variant="secondary" size="s">
          Result not yet shared with speakers. Click the button below to publish the result to speakers.
        </Text>
        <Checkbox id="send-email" name="send-email">
          Notify speakers via email
        </Checkbox>
        <Button variant="secondary" block>
          Publish result to speakers
        </Button>
      </Form>
    );
  }
}
