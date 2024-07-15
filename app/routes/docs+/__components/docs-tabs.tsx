import { BookOpenIcon, LockClosedIcon, NewspaperIcon } from '@heroicons/react/24/outline';

import { Page } from '~/design-system/layouts/page.tsx';
import { NavTab, NavTabs } from '~/design-system/navigation/nav-tabs.tsx';

type Props = { className?: string };

export function DocsTabs({ className }: Props) {
  return (
    <Page.NavHeader>
      <NavTabs py={4} scrollable className={className}>
        <NavTab to="/docs/terms" icon={BookOpenIcon} end>
          Terms
        </NavTab>

        <NavTab to="/docs/privacy" icon={LockClosedIcon}>
          Privacy
        </NavTab>

        <NavTab to="/docs/license" icon={NewspaperIcon}>
          License
        </NavTab>
      </NavTabs>
    </Page.NavHeader>
  );
}
