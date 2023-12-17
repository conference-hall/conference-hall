import { PencilSquareIcon } from '@heroicons/react/24/outline';
import type { ActionFunction, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { TalksLibrary } from '~/.server/speaker-talks-library/TalksLibrary.ts';
import { ButtonLink } from '~/design-system/Buttons.tsx';
import { PageContent } from '~/design-system/layouts/PageContent.tsx';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { ProposalDetailsSection } from '~/routes/__components/proposals/ProposalDetailsSection.tsx';
import { ProposalSubmissionsSection } from '~/routes/__components/proposals/ProposalSubmissionsSection.tsx';

import { ArchiveOrRestoreTalkButton } from './__components/ArchiveOrRestoreTalkButton.tsx';

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
    <>
      <PageHeaderTitle title={talk.title} backTo="/speaker/talks">
        <ArchiveOrRestoreTalkButton archived={talk.archived} />
        <ButtonLink iconLeft={PencilSquareIcon} to="edit" variant="secondary">
          Edit
        </ButtonLink>
      </PageHeaderTitle>

      <PageContent>
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
      </PageContent>
    </>
  );
}
