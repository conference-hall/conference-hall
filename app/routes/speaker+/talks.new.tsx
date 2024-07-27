import { parseWithZod } from '@conform-to/zod';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useActionData } from '@remix-run/react';

import { TalksLibrary } from '~/.server/speaker-talks-library/talks-library.ts';
import { TalkSaveSchema } from '~/.server/speaker-talks-library/talks-library.types.ts';
import { Button } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H1 } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { redirectWithToast } from '~/libs/toasts/toast.server.ts';

import { TalkForm } from '../__components/talks/talk-forms/talk-form.tsx';

export const meta = mergeMeta(() => [{ title: 'New talk | Conference Hall' }]);

export const action = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  const form = await request.formData();

  const result = parseWithZod(form, { schema: TalkSaveSchema });
  if (result.status !== 'success') return json(result.error);

  const talk = await TalksLibrary.of(userId).add(result.value);
  return redirectWithToast(`/speaker/talks/${talk.id}`, 'success', 'New talk created.');
};

export default function NewTalkRoute() {
  const errors = useActionData<typeof action>();

  return (
    <Page className="md:mt-4 lg:mt-4">
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
