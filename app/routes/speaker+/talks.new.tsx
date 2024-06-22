import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useActionData } from '@remix-run/react';

import { TalksLibrary } from '~/.server/speaker-talks-library/talks-library.ts';
import { TalkSaveSchema } from '~/.server/speaker-talks-library/talks-library.types.ts';
import { Button } from '~/design-system/Buttons.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { redirectWithToast } from '~/libs/toasts/toast.server.ts';
import { parseWithZod } from '~/libs/zod-parser.ts';

import { TalkForm } from '../__components/talks/talk-forms/talk-form.tsx';

export const meta = mergeMeta(() => [{ title: 'New talk | Conference Hall' }]);

export const action = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  const form = await request.formData();

  const result = parseWithZod(form, TalkSaveSchema);
  if (!result.success) return json(result.error);

  const talk = await TalksLibrary.of(userId).add(result.value);
  return redirectWithToast(`/speaker/talks/${talk.id}`, 'success', 'New talk created.');
};

export default function NewTalkRoute() {
  const errors = useActionData<typeof action>();

  return (
    <Page>
      <h1 className="sr-only">Create a new talk</h1>
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
