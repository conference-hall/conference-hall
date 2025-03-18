import { parseWithZod } from '@conform-to/zod';
import { redirect } from 'react-router';
import { TalksLibrary } from '~/.server/speaker-talks-library/talks-library.ts';
import { TalkSaveSchema } from '~/.server/speaker-talks-library/talks-library.types.ts';
import { Button } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H1 } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { toastHeaders } from '~/libs/toasts/toast.server.ts';
import { TalkForm } from '../components/talks/talk-forms/talk-form.tsx';
import type { Route } from './+types/talks.new.ts';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'New talk | Conference Hall' }]);
};

export const action = async ({ request }: Route.ActionArgs) => {
  const userId = await requireSession(request);
  const form = await request.formData();
  const result = parseWithZod(form, { schema: TalkSaveSchema });
  if (result.status !== 'success') return result.error;

  const talk = await TalksLibrary.of(userId).add(result.value);

  const headers = await toastHeaders('success', 'New talk created.');
  return redirect(`/speaker/talks/${talk.id}`, { headers });
};

export default function NewTalkRoute({ actionData: errors }: Route.ComponentProps) {
  return (
    <Page>
      <H1 srOnly>Create a new talk</H1>

      <Card>
        <Card.Content>
          <TalkForm id="new-talk-form" errors={errors} />
        </Card.Content>

        <Card.Actions>
          <Button type="submit" form="new-talk-form">
            Create new talk
          </Button>
        </Card.Actions>
      </Card>
    </Page>
  );
}
