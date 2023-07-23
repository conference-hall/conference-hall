import { useMemo } from 'react';

import { Container } from '~/design-system/layouts/Container';
import { NavTabs } from '~/design-system/navigation/NavTabs';
import type { EventType } from '~/schemas/event';

type Props = { slug: string; type: EventType; surveyEnabled: boolean };

export function EventTabs({ slug, type, surveyEnabled }: Props) {
  const eventTabs = useMemo(
    () => [
      { to: `/${slug}`, label: type === 'CONFERENCE' ? 'Conference' : 'Meetup', enabled: true, end: true },
      { to: `/${slug}/proposals`, label: 'Your proposals', enabled: true },
      { to: `/${slug}/survey`, label: 'Survey', enabled: surveyEnabled },
    ],
    [slug, type, surveyEnabled],
  );

  return (
    <div className="bg-gray-800">
      <Container>
        <NavTabs tabs={eventTabs} variant="dark" py={4} />
      </Container>
    </div>
  );
}