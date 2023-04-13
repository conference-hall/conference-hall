import invariant from 'tiny-invariant';
import type { ActionFunction, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getTalk } from '~/shared-server/talks/get-talk.server';
import { archiveTalk, restoreTalk } from './server/archive-talk.server';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { sessionRequired } from '~/libs/auth/auth.server';
import { mapErrorToResponse } from '~/libs/errors';
import { Container } from '~/design-system/Container';
import { ButtonLink } from '~/design-system/Buttons';
import { ArchiveOrRestoreTalkButton } from './components/ArchiveOrRestoreTalkButton';
import { ProposalDetailsSection } from '~/shared-components/proposals/ProposalDetailsSection';
import { ProposalSubmissionsSection } from '~/shared-components/proposals/ProposalSubmissionsSection';
import { PageHeaderTitle } from '~/design-system/PageHeaderTitle';

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  invariant(params.talk, 'Invalid talk id');

  try {
    const talk = await getTalk(uid, params.talk);
    return json(talk);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const { uid } = await sessionRequired(request);
  invariant(params.talk, 'Invalid talk id');

  const form = await request.formData();
  const action = form.get('_action');
  if (action === 'archive-talk') {
    await archiveTalk(uid, params.talk);
  } else if (action === 'restore-talk') {
    await restoreTalk(uid, params.talk);
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
