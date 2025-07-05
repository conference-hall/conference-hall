import { BookOpenIcon, LockClosedIcon, NewspaperIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { href, Outlet } from 'react-router';
import { Page } from '~/shared/design-system/layouts/page.tsx';
import { NavTab, NavTabs } from '~/shared/design-system/navigation/nav-tabs.tsx';
import { Footer } from '../../routes/components/footer.tsx';
import { Navbar } from '../../routes/components/navbar/navbar.tsx';

export default function DocsRoute() {
  const { t } = useTranslation();
  return (
    <>
      <Navbar />

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
        <main className=" bg-white shadow-xs rounded-lg p-8 border border-gray-200">
          <Outlet />
        </main>
      </Page>

      <Footer />
    </>
  );
}
