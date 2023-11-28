import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';

import { PageContent } from '~/design-system/layouts/PageContent';
import { H1 } from '~/design-system/Typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireSession(request);
  return json(null);
};

export default function ResultsAnnouncementPublish() {
  return (
    <PageContent className="flex flex-col">
      <H1>Publish accepted proposals</H1>
    </PageContent>
  );
}
