import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { href } from 'react-router';
import { ButtonLink } from '~/shared/design-system/buttons.tsx';
import { Page } from '~/shared/design-system/layouts/page.tsx';
import { NavTab, NavTabs } from '~/shared/design-system/navigation/nav-tabs.tsx';
import type { CfpState, EventType } from '~/types/events.types.ts';

type Props = {
  slug: string;
  type: EventType;
  cfpState: CfpState;
  hasSurvey: boolean;
  isAuthenticated: boolean;
  className?: string;
};

export function EventTabs({ slug, type, cfpState, hasSurvey, isAuthenticated, className }: Props) {
  const { t } = useTranslation();

  return (
    <Page.NavHeader className="flex flex-col pb-2 sm:pb-0 sm:flex-row sm:items-center sm:space-between">
      <NavTabs py={4} scrollable className={cx('grow', className)}>
        <NavTab to={href('/:event', { event: slug })} end>
          {t(`common.event.type.label.${type}`)}
        </NavTab>

        {isAuthenticated ? (
          <NavTab to={href('/:event/proposals', { event: slug })}>{t('event.nav.proposals')}</NavTab>
        ) : null}

        {isAuthenticated && hasSurvey ? (
          <NavTab to={href('/:event/survey', { event: slug })}>{t('event.nav.survey')}</NavTab>
        ) : null}
      </NavTabs>

      {cfpState === 'OPENED' && (
        <ButtonLink to={href('/:event/submission', { event: slug })}>{t('event.nav.submit-proposal')}</ButtonLink>
      )}
    </Page.NavHeader>
  );
}
