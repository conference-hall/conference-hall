import type { LoaderFunctionArgs } from '@remix-run/node';
import { Page } from '~/design-system/layouts/page.tsx';
import { H1 } from '~/design-system/typography.tsx';

import { requireSession } from '~/libs/auth/session.ts';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireSession(request);
  return null;
};

export default function AdminLayoutRoute() {
  return (
    <Page>
      <H1>Admin page</H1>
    </Page>
  );
}
