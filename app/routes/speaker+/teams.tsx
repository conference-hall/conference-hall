import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';

import { Page } from '~/design-system/layouts/PageContent.tsx';
import { H1 } from '~/design-system/Typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';

export const meta = mergeMeta(() => [{ title: 'My teams | Conference Hall' }]);

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireSession(request);
  return json(null);
};

export default function SpeakerTeamsRoute() {
  return (
    <Page className="space-y-8">
      <div className="flex items-center justify-between">
        <H1>My teams</H1>
      </div>
    </Page>
  );
}
