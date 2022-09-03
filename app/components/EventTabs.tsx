import { useMemo } from 'react';
import { NavTabs } from '~/design-system/NavTabs';
import type { CfpState } from '~/utils/event';

type Props = { slug: string; type: 'CONFERENCE' | 'MEETUP'; cfpState: CfpState; surveyEnabled: boolean };

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
