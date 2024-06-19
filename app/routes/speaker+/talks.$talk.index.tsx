import type { ActionFunction, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { TalksLibrary } from '~/.server/speaker-talks-library/TalksLibrary.ts';
import { Page } from '~/design-system/layouts/PageContent.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { toast } from '~/libs/toasts/toast.server.ts';

import { ActivityFeed } from '../__components/talks/activity-feed';
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

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireSession(request);
  invariant(params.talk, 'Invalid talk id');

  const talk = TalksLibrary.of(userId).talk(params.talk);

  const form = await request.formData();
  const action = form.get('intent');

  switch (action) {
    case 'archive-talk':
      await talk.archive();
      return toast('success', 'Talk archived.');

    case 'restore-talk':
      await talk.restore();
      return toast('success', 'Talk restored.');

    case 'remove-speaker':
      await talk.removeCoSpeaker(form.get('_speakerId')?.toString() as string);
      return toast('success', 'Co-speaker removed from talk.');
  }
  return null;
};

export default function SpeakerTalkRoute() {
  const talk = useLoaderData<typeof loader>();

  return (
    <Page>
      <TalkSection talk={talk} canEdit canArchive canSubmit />

      <div className="pl-4 pt-8 md:w-2/3">
        <ActivityFeed activity={['1']} />
      </div>
    </Page>
  );
}
