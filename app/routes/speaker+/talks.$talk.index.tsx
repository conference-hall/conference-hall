import type { ActionFunction, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { TalksLibrary } from '~/.server/speaker-talks-library/TalksLibrary.ts';
import { Page } from '~/design-system/layouts/PageContent.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { ProposalDetailsSection } from '~/routes/__components/proposals/ProposalDetailsSection.tsx';
import { ProposalSubmissionsSection } from '~/routes/__components/proposals/ProposalSubmissionsSection.tsx';

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
  const action = form.get('_action');
  switch (action) {
    case 'archive-talk':
      await talk.archive();
      return toast('success', 'Talk archived.');

    case 'restore-talk':
      await talk.restore();
      return toast('success', 'Talk restored.');
  }
  return null;
};

export default function SpeakerTalkRoute() {
  const talk = useLoaderData<typeof loader>();

  return (
    <Page>
      <div className="grid grid-cols-1 gap-6 lg:grid-flow-col-dense lg:grid-cols-3">
        <div className="lg:col-span-2 lg:col-start-1">
          <ProposalDetailsSection
            abstract={talk.abstract}
            references={talk.references}
            level={talk.level}
            languages={talk.languages}
            speakers={talk.speakers}
          />
        </div>

        <div className="lg:col-span-1 lg:col-start-3">
          <ProposalSubmissionsSection talkId={talk.id} submissions={talk.submissions} />
        </div>
      </div>
    </Page>
  );
}
