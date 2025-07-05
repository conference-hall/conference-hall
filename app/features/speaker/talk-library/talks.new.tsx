import { parseWithZod } from '@conform-to/zod';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { href, redirect } from 'react-router';
import { TalksLibrary } from '~/.server/speaker-talks-library/talks-library.ts';
import { TalkSaveSchema } from '~/.server/speaker-talks-library/talks-library.types.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { requireUserSession } from '~/shared/auth/session.ts';
import { Button } from '~/shared/design-system/buttons.tsx';
import { Card } from '~/shared/design-system/layouts/card.tsx';
import { Page } from '~/shared/design-system/layouts/page.tsx';
import { H1 } from '~/shared/design-system/typography.tsx';
import { i18n } from '~/shared/i18n/i18n.server.ts';
import { toastHeaders } from '~/shared/toasts/toast.server.ts';
import type { Route } from './+types/talks.new.ts';
import { TalkForm } from './components/talk-forms/talk-form.tsx';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'New talk | Conference Hall' }]);
};

export const action = async ({ request }: Route.ActionArgs) => {
  const t = await i18n.getFixedT(request);
  const { userId } = await requireUserSession(request);
  const form = await request.formData();
  const result = parseWithZod(form, { schema: TalkSaveSchema });
  if (result.status !== 'success') return result.error;

  const talk = await TalksLibrary.of(userId).add(result.value);

  const headers = await toastHeaders('success', t('talk.feedbacks.created'));
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
