import { BookOpenIcon, LockClosedIcon, NewspaperIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { href, Outlet } from 'react-router';
import { Page } from '~/design-system/layouts/page.tsx';
import { NavTab, NavTabs } from '~/design-system/navigation/nav-tabs.tsx';
import { Footer } from '../components/footer.tsx';
import { NavbarEvent } from '../components/navbar/navbar-event.tsx';

export default function DocsRoute() {
  const { t } = useTranslation();
  return (
    <>
      <NavbarEvent />

      <Page.NavHeader>
        <NavTabs py={4} scrollable>
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

      <Page className="prose prose-sm">
        <main className="rounded-lg border border-gray-200 bg-white p-8 shadow-xs">
          <Outlet />
        </main>
      </Page>

      <Footer />
    </>
  );
}
