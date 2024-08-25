import { ArrowRightIcon } from '@heroicons/react/20/solid';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useState } from 'react';

import { ButtonLink } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { FullscreenPage } from '~/routes/__components/fullscreen-page.tsx';
import type { EventType } from '~/types/events.types.ts';

import { EventTypeRadioGroup } from '../../__components/events/event-type-radio-group.tsx';
import { useTeam } from '../__components/use-team.tsx';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireSession(request);
  return null;
};

export default function NewEventTypeRoute() {
  const { team } = useTeam();

  const [type, setType] = useState<EventType>('CONFERENCE');

  return (
    <>
      <FullscreenPage.Title title="Select your event type." subtitle="Is it a conference or a meetup?" />

      <Card>
        <Card.Content>
          <EventTypeRadioGroup selected={type} onSelect={setType} />
        </Card.Content>

        <Card.Actions>
          <ButtonLink to={`/team/${team.slug}`} type="button" variant="secondary">
            Cancel
          </ButtonLink>
          <ButtonLink to={`/team/${team.slug}/new/type/${type}`} type="button" replace iconRight={ArrowRightIcon}>
            Continue
          </ButtonLink>
        </Card.Actions>
      </Card>
    </>
  );
}
