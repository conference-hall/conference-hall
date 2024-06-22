import { MegaphoneIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import type { LoaderFunctionArgs } from '@remix-run/node';

import { Card } from '~/design-system/layouts/Card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H1, Subtitle } from '~/design-system/Typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';

import { EventTypeButton } from './__components/EventTypeButton.tsx';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireSession(request);
  return null;
};

export default function NewEventTypeRoute() {
  return (
    <Page className="flex flex-col">
      <Card>
        <Card.Title>
          <H1>Select your new event type</H1>
          <Subtitle>Is it a conference or a meetup?</Subtitle>
        </Card.Title>

        <Card.Content>
          <EventTypeButton
            type="CONFERENCE"
            label="Conference"
            description="With conference, the call for papers is open to proposals for a specific period."
            icon={MegaphoneIcon}
          />
          <EventTypeButton
            type="MEETUP"
            label="Meetup"
            description="With meetup, you can manually open or close the call for paper."
            icon={UserGroupIcon}
          />
        </Card.Content>
      </Card>
    </Page>
  );
}
