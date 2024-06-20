import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useActionData, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { TalksLibrary } from '~/.server/speaker-talks-library/TalksLibrary.ts';
import { TalkSaveSchema } from '~/.server/speaker-talks-library/TalksLibrary.types';
import { Page } from '~/design-system/layouts/PageContent.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { parseWithZod } from '~/libs/zod-parser';

import { TalkActivityFeed } from '../__components/talks/talk-activity/talk-activity-feed';
import { TalkSection } from '../__components/talks/talk-section';

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
  const action = form.get('intent');

  switch (action) {
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
      const result = parseWithZod(form, TalkSaveSchema);
      if (!result.success) {
        return json(result.error);
      }
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
      <TalkSection talk={talk} errors={errors} canEditSpeakers canEditTalk canArchive canSubmit />

      <div className="pl-4 pt-8 md:w-2/3">
        <TalkActivityFeed activity={['1']} />
      </div>
    </Page>
  );
}
