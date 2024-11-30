import { cx } from 'class-variance-authority';

import { ButtonLink } from '~/design-system/buttons.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { NavTab, NavTabs } from '~/design-system/navigation/nav-tabs.tsx';
import type { CfpState, EventType } from '~/types/events.types';

type Props = {
  slug: string;
  type: EventType;
  cfpState: CfpState;
  hasSurvey: boolean;
  isAuthenticated: boolean;
  className?: string;
};

export function EventTabs({ slug, type, cfpState, hasSurvey, isAuthenticated, className }: Props) {
  return (
    <Page.NavHeader className="flex flex-col pb-2 sm:pb-0 sm:flex-row sm:items-center sm:space-between">
      <NavTabs py={4} scrollable className={cx('grow', className)}>
        <NavTab to={`/${slug}`} end>
          {type === 'CONFERENCE' ? 'Conference' : 'Meetup'}
        </NavTab>

        {isAuthenticated ? <NavTab to={`/${slug}/proposals`}>Your proposals</NavTab> : null}

        {isAuthenticated && hasSurvey ? <NavTab to={`/${slug}/survey`}>Survey</NavTab> : null}
      </NavTabs>

      {cfpState === 'OPENED' && <ButtonLink to="submission">Submit a proposal</ButtonLink>}
    </Page.NavHeader>
  );
}
