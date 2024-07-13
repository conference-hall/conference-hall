import { parseWithZod } from '@conform-to/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useActionData, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { TalksLibrary } from '~/.server/speaker-talks-library/talks-library.ts';
import { TalkSaveSchema } from '~/.server/speaker-talks-library/talks-library.types.ts';
import { Page } from '~/design-system/layouts/page.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { toast } from '~/libs/toasts/toast.server.ts';

import { TalkSection } from '../__components/talks/talk-section.tsx';
import { TalkSubmissionsSection } from '../__components/talks/talk-submissions-section.tsx';

export const meta = mergeMeta<typeof loader>(({ data }) =>
  data ? [{ title: `${data?.title} | Conference Hall` }] : [],
);

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.talk, 'Invalid talk id');

  const talk = await TalksLibrary.of(userId).talk(params.talk).get();
  return json(talk);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.talk, 'Invalid talk id');

  const talk = TalksLibrary.of(userId).talk(params.talk);

  const form = await request.formData();
  const intent = form.get('intent');

  switch (intent) {
    case 'archive-talk': {
      await talk.archive();
      return toast('success', 'Talk archived.');
    }
    case 'restore-talk': {
      await talk.restore();
      return toast('success', 'Talk restored.');
    }
    case 'remove-speaker': {
      await talk.removeCoSpeaker(form.get('_speakerId')?.toString() as string);
      return toast('success', 'Co-speaker removed from talk.');
    }
    case 'edit-talk': {
      const result = parseWithZod(form, { schema: TalkSaveSchema });
      if (result.status !== 'success') return json(result.error);
      await talk.update(result.value);
      return toast('success', 'Talk updated.');
    }
    default:
      return json(null);
  }
};

export default function SpeakerTalkRoute() {
  const talk = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();

  return (
    <Page>
      <h1 className="sr-only">Talk page</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
        <div className="lg:col-span-7">
          <TalkSection talk={talk} errors={errors} canEditSpeakers canEditTalk canArchive />
        </div>

        <div className="lg:col-span-3">
          <TalkSubmissionsSection talkId={talk.id} canSubmit={!talk.archived} submissions={talk.submissions} />
        </div>
      </div>
    </Page>
  );
}
