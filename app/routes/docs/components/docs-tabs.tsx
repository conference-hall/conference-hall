import { BookOpenIcon, LockClosedIcon, NewspaperIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { href } from 'react-router';

import { Page } from '~/shared/design-system/layouts/page.tsx';
import { NavTab, NavTabs } from '~/shared/design-system/navigation/nav-tabs.tsx';

type Props = { className?: string };

export function DocsTabs({ className }: Props) {
  const { t } = useTranslation();

  return (
    <Page.NavHeader>
      <NavTabs py={4} scrollable className={className}>
        <NavTab to={href('/docs/terms')} icon={BookOpenIcon} end>
          {t('footer.terms')}
        </NavTab>

        <NavTab to={href('/docs/privacy')} icon={LockClosedIcon}>
          {t('footer.privacy')}
        </NavTab>

        <NavTab to={href('/docs/license')} icon={NewspaperIcon}>
          {t('footer.license')}
        </NavTab>
      </NavTabs>
    </Page.NavHeader>
  );
}
