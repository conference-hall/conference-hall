import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form } from '@remix-run/react';
import { AcceptedProposalEmailJob } from 'jobs/emails/AcceptedProposalEmailJob';

import { Button } from '~/design-system/Buttons';
import { requireSession } from '~/libs/auth/session.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireSession(request);
  return json(null);
};

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  await requireSession(request);
  const job = new AcceptedProposalEmailJob();
  await job.trigger({ from: 'youiui', to: ['yo'], variables: { name: 'yo' } });
  return json(null);
};

export default function AcceptedProposalEmails() {
  return (
    <div>
      <Form method="POST">
        <Button type="submit">Send</Button>
      </Form>
    </div>
  );
}
