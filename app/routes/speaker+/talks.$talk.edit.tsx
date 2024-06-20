import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useActionData, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { TalksLibrary } from '~/.server/speaker-talks-library/TalksLibrary';
import { TalkSaveSchema } from '~/.server/speaker-talks-library/TalksLibrary.types';
import { Button, ButtonLink } from '~/design-system/Buttons.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { Page } from '~/design-system/layouts/PageContent.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { redirectWithToast } from '~/libs/toasts/toast.server.ts';
import { parseWithZod } from '~/libs/zod-parser';

import { TalkForm } from '../__components/talks/talk-forms/talk-form';

export const meta = mergeMeta<typeof loader>(({ data }) =>
  data ? [{ title: `Edit | ${data?.title} | Conference Hall` }] : [],
);

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.talk, 'Invalid talk id');

  const library = TalksLibrary.of(userId);
  const talk = await library.talk(params.talk).get();
  if (talk.archived) throw new Response('Talk archived.', { status: 403 });

  return json(talk);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  const form = await request.formData();
  invariant(params.talk, 'Invalid talk id');

  const talk = TalksLibrary.of(userId).talk(params.talk);

  const result = parseWithZod(form, TalkSaveSchema);
  if (!result.success) return json(result.error);
  await talk.update(result.value);
  return redirectWithToast(`/speaker/talks/${params.talk}`, 'success', 'Talk updated.');
};

export default function SpeakerTalkRoute() {
  const talk = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();

  return (
    <Page>
      <Card className="lg:col-span-2 lg:col-start-1">
        <Card.Content>
          <TalkForm id="edit-talk-form" initialValues={talk} errors={errors} />
        </Card.Content>
        <Card.Actions>
          <ButtonLink to={`/speaker/talks/${talk.id}`} variant="secondary">
            Cancel
          </ButtonLink>
          <Button type="submit" name="intent" value="talk-edit" form="edit-talk-form">
            Save talk
          </Button>
        </Card.Actions>
      </Card>
    </Page>
  );
}
