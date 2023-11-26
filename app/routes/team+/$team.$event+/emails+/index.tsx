import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';

import { H1 } from '~/design-system/Typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireSession(request);
  return json(null);
};

export default function AcceptedProposalEmails() {
  return (
    <>
      <H1>Results</H1>
    </>
  );
}
