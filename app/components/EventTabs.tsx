import type { CfpState, EventType } from '~/schemas/event';
import { useMemo } from 'react';
import { NavTabs } from '~/design-system/NavTabs';

type Props = { slug: string; type: EventType; cfpState: CfpState; surveyEnabled: boolean };

export function EventTabs({ slug, type, cfpState, surveyEnabled }: Props) {
  const eventTabs = useMemo(
    () => [
      { to: `/${slug}`, label: type === 'CONFERENCE' ? 'Conference' : 'Meetup', enabled: true, end: true },
      { to: `/${slug}/proposals`, label: 'Your proposals', enabled: true },
      { to: `/${slug}/survey`, label: 'Survey', enabled: surveyEnabled },
      { to: `/${slug}/submission`, label: 'Submit a proposal', enabled: cfpState === 'OPENED' },
    ],
    [slug, type, cfpState, surveyEnabled]
  );

  return <NavTabs tabs={eventTabs} />;
}
