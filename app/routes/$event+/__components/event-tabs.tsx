import { Page } from '~/design-system/layouts/page.tsx';
import { NavTab, NavTabs } from '~/design-system/navigation/nav-tabs.tsx';
import type { EventType } from '~/types/events.types';

type Props = { slug: string; type: EventType; surveyEnabled: boolean; isAuthenticated: boolean; className?: string };

export function EventTabs({ slug, type, surveyEnabled, isAuthenticated, className }: Props) {
  return (
    <Page.NavHeader>
      <NavTabs py={4} scrollable className={className}>
        <NavTab to={`/${slug}`} end>
          {type === 'CONFERENCE' ? 'Conference' : 'Meetup'}
        </NavTab>

        {isAuthenticated ? <NavTab to={`/${slug}/proposals`}>Your proposals</NavTab> : null}

        {isAuthenticated && surveyEnabled ? <NavTab to={`/${slug}/survey`}>Survey</NavTab> : null}
      </NavTabs>
    </Page.NavHeader>
  );
}
