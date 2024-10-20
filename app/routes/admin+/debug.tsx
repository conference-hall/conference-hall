import type { ActionFunctionArgs } from '@remix-run/node';
import { Form, json } from '@remix-run/react';
import { testJob } from '~/.server/shared/jobs/test.job';

import { Button } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H1 } from '~/design-system/typography.tsx';

export const loader = async () => {
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const form = await request.formData();
  const intent = form.get('intent') as string;

  switch (intent) {
    case 'simulate-server-error': {
      throw new Error('Failed');
    }
    case 'test-job-call': {
      await testJob.trigger();
      break;
    }
  }
  return json(null);
};

export default function DebugPage() {
  return (
    <Page>
      <H1 srOnly>Users</H1>
      <Card className="p-8">
        <Form method="POST" className="space-x-8">
          <Button type="submit" name="intent" value="test-job-call" variant="secondary">
            Test job call
          </Button>
          <Button type="submit" name="intent" value="simulate-server-error" variant="secondary">
            Simulate server error
          </Button>
        </Form>
      </Card>
    </Page>
  );
}
