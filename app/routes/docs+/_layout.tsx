import { Outlet } from 'react-router';

import { Page } from '~/design-system/layouts/page.tsx';

import { Footer } from '../__components/footer.tsx';
import { Navbar } from '../__components/navbar/navbar.tsx';
import { DocsTabs } from './__components/docs-tabs.tsx';

export default function DocsRoute() {
  return (
    <>
      <Navbar />

      <DocsTabs />

      <Page className="prose prose-sm">
        <main className=" bg-white shadow-sm rounded-lg p-8 border border-gray-200">
          <Outlet />
        </main>
      </Page>

      <Footer />
    </>
  );
}
