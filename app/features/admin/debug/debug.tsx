import { parseWithZod } from '@conform-to/zod';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { Button } from '~/design-system/buttons.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H1, H2 } from '~/design-system/typography.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import { i18n } from '~/shared/i18n/i18n.server.ts';
import { toast } from '~/shared/toasts/toast.server.ts';
import type { Route } from './+types/debug.ts';
import { AdminDebug, TestEmailSchema } from './services/admin-debug.server.ts';

export const action = async ({ request }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);
  const t = await i18n.getFixedT(request);
  const debug = await AdminDebug.for(userId);
  const form = await request.formData();
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
      return toast('success', t('admin.debug.email.feedbacks.sent'));
    }
  }
  return null;
};

export default function AdminDebugPage({ actionData: errors }: Route.ComponentProps) {
  const { t } = useTranslation();
  return (
    <Page className="space-y-6">
      <H1 srOnly>{t('admin.nav.debug')}</H1>

      <Card>
        <Card.Title>
          <H2>{t('admin.debug.tools.heading')}</H2>
        </Card.Title>
        <Card.Content className="flex gap-8">
          <Form method="POST" className="flex gap-8">
            <Button type="submit" name="intent" value="test-job-call" variant="secondary">
              {t('admin.debug.tools.job')}
            </Button>
            <Button type="submit" name="intent" value="simulate-server-error" variant="secondary">
              {t('admin.debug.tools.server-error')}
            </Button>
          </Form>
          <form
            method="GET"
            action="/admin/debug/heap-snapshot"
            onSubmit={() => {
              if (!confirm(t('common.confirmation'))) return;
            }}
          >
            <Button type="submit" variant="secondary">
              {t('admin.debug.tools.heap-snapshot')}
            </Button>
          </form>
        </Card.Content>
      </Card>

      <Card>
        <Card.Title>
          <H2>{t('admin.debug.email.heading')}</H2>
        </Card.Title>
        <Card.Content>
          <Form method="POST" className="flex gap-2">
            <Input type="email" name="to" placeholder={t('common.email')} error={errors?.to} required />
            <Button type="submit" name="intent" value="send-email" variant="secondary">
              {t('admin.debug.email.send')}
            </Button>
          </Form>
        </Card.Content>
      </Card>
    </Page>
  );
}
