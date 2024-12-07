import { parseWithZod } from '@conform-to/zod';
import type { ActionFunctionArgs } from 'react-router';
import { Form, useActionData } from 'react-router';
import { AdminDebug, TestEmailSchema } from '~/.server/admin/admin-debug.ts';

import { Button } from '~/design-system/buttons.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H1, H2 } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { toast } from '~/libs/toasts/toast.server.ts';

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  const form = await request.formData();
  const debug = await AdminDebug.for(userId);

  const intent = form.get('intent') as string;
  switch (intent) {
    case 'simulate-server-error': {
      debug.simulateServerError();
      break;
    }
    case 'test-job-call': {
      await debug.sendTestJobcall();
      break;
    }
    case 'send-email': {
      const result = parseWithZod(form, { schema: TestEmailSchema });
      if (result.status !== 'success') return result.error;
      await debug.sendTestEmail(result.value);
      return toast('success', 'Email sent');
    }
  }
  return null;
};

export default function AdminDebugPage() {
  const errors = useActionData<typeof action>();

  return (
    <Page className="space-y-6">
      <H1 srOnly>Debug page</H1>

      <Card>
        <Card.Title>
          <H2>Debug tools</H2>
        </Card.Title>
        <Card.Content className="flex gap-8">
          <Form method="POST" className="flex gap-8">
            <Button type="submit" name="intent" value="test-job-call" variant="secondary">
              Test job call
            </Button>
            <Button type="submit" name="intent" value="simulate-server-error" variant="secondary">
              Simulate server error
            </Button>
          </Form>
          <form
            method="GET"
            action="/admin/debug/heap-snapshot"
            onSubmit={() => {
              if (!confirm('Are you sure?')) return;
            }}
          >
            <Button type="submit" variant="secondary">
              Generate Heap Snapshot
            </Button>
          </form>
        </Card.Content>
      </Card>

      <Card>
        <Card.Title>
          <H2>Email tester</H2>
        </Card.Title>
        <Card.Content>
          <Form method="POST" className="flex gap-2">
            <Input type="email" name="to" placeholder="Email" error={errors?.to} required />
            <Button type="submit" name="intent" value="send-email" variant="secondary">
              Send email
            </Button>
          </Form>
        </Card.Content>
      </Card>
    </Page>
  );
}
