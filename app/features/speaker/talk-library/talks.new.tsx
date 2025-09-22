import { parseWithZod } from '@conform-to/zod/v4';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { href, redirect } from 'react-router';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { Button } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H1 } from '~/design-system/typography.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import { getI18n } from '~/shared/i18n/i18n.middleware.ts';
import { toastHeaders } from '~/shared/toasts/toast.server.ts';
import type { Route } from './+types/talks.new.ts';
import { TalkForm } from './components/talk-forms/talk-form.tsx';
import { TalkSaveSchema } from './services/talks-library.schema.server.ts';
import { TalksLibrary } from './services/talks-library.server.ts';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'New talk | Conference Hall' }]);
};

export const action = async ({ request, context }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);

  const i18n = getI18n(context);
  const form = await request.formData();
  const result = parseWithZod(form, { schema: TalkSaveSchema });
  if (result.status !== 'success') return result.error;

  const talk = await TalksLibrary.of(userId).add(result.value);

  const headers = await toastHeaders('success', i18n.t('talk.feedbacks.created'));
  return redirect(href('/speaker/talks/:talk', { talk: talk.id }), { headers });
};

export default function NewTalkRoute({ actionData: errors }: Route.ComponentProps) {
  const { t } = useTranslation();
  const formId = useId();

  return (
    <Page>
      <H1 srOnly>{t('talk.new.heading')}</H1>

      <Card>
        <Card.Content>
          <TalkForm id={formId} errors={errors} />
        </Card.Content>

        <Card.Actions>
          <Button type="submit" form={formId}>
            {t('talk.new.submit')}
          </Button>
        </Card.Actions>
      </Card>
    </Page>
  );
}
