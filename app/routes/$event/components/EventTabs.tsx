import type { EventType } from '~/schemas/event';
import { useMemo } from 'react';
import { NavTabs } from '~/design-system/NavTabs';

type Props = { slug: string; type: EventType; surveyEnabled: boolean };

export function EventTabs({ slug, type, surveyEnabled }: Props) {
  const eventTabs = useMemo(
    () => [
      { to: `/${slug}`, label: type === 'CONFERENCE' ? 'Conference' : 'Meetup', enabled: true, end: true },
      { to: `/${slug}/proposals`, label: 'Your proposals', enabled: true },
      { to: `/${slug}/survey`, label: 'Survey', enabled: surveyEnabled },
    ],
    [slug, type, surveyEnabled]
  );

  return <NavTabs tabs={eventTabs} />;
}
