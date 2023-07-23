import { PencilSquareIcon } from '@heroicons/react/24/outline';
import type { ActionFunction, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { ProposalDetailsSection } from '~/components/proposals/ProposalDetailsSection';
import { ProposalSubmissionsSection } from '~/components/proposals/ProposalSubmissionsSection';
import { ButtonLink } from '~/design-system/Buttons';
import { Container } from '~/design-system/layouts/Container';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle';
import { requireSession } from '~/libs/auth/session';
import { mergeMeta } from '~/libs/meta/merge-meta';
import { addToast } from '~/libs/toasts/toasts';
import { getTalk } from '~/server/talks/get-talk.server';

import { ArchiveOrRestoreTalkButton } from './components/ArchiveOrRestoreTalkButton';
import { archiveTalk, restoreTalk } from './server/archive-talk.server';

export const meta = mergeMeta<typeof loader>(({ data }) =>
  data ? [{ title: `${data?.title} | Conference Hall` }] : [],
);

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireSession(request);
  invariant(params.talk, 'Invalid talk id');

  const talk = await getTalk(userId, params.talk);
  return json(talk);
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireSession(request);
  invariant(params.talk, 'Invalid talk id');

  const form = await request.formData();
  const action = form.get('_action');

  switch (action) {
    case 'archive-talk':
      await archiveTalk(userId, params.talk);
      return json(null, await addToast(request, 'Talk archived.'));

    case 'restore-talk':
      await restoreTalk(userId, params.talk);
      return json(null, await addToast(request, 'Talk restored.'));
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

      <Container className="mt-4 space-y-8 sm:mt-8">
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
      </Container>
    </>
  );
}
