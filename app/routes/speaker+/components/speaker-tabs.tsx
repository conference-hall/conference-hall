import { Cog6ToothIcon, FireIcon, MicrophoneIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { href } from 'react-router';
import { Page } from '~/design-system/layouts/page.tsx';
import { NavTab, NavTabs } from '~/design-system/navigation/nav-tabs.tsx';

type Props = { className?: string };

export function SpeakerTabs({ className }: Props) {
  const { t } = useTranslation();
  return (
    <Page.NavHeader className="flex flex-col pb-2 sm:pb-0 sm:flex-row sm:items-center sm:space-between">
      <NavTabs py={4} scrollable className={cx('grow', className)}>
        <NavTab to={href('/speaker')} icon={FireIcon} end>
          {t('speaker.nav.activity')}
        </NavTab>

        <NavTab to={href('/speaker/talks')} icon={MicrophoneIcon}>
          {t('speaker.nav.talks')}
        </NavTab>

        <NavTab to={href('/speaker/settings')} icon={Cog6ToothIcon}>
          {t('speaker.nav.settings')}
        </NavTab>
      </NavTabs>
    </Page.NavHeader>
  );
}
