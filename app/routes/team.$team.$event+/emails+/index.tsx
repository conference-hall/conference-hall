import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { PageContent } from '~/design-system/layouts/PageContent.tsx';
import { H1 } from '~/design-system/Typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  return json({});
};

export default function AcceptedProposalEmails() {
  return (
    <PageContent>
      <H1>Acceptation emails campaign</H1>
    </PageContent>
  );
}
