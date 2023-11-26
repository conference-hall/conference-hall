import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { ButtonLink } from '~/design-system/Buttons.tsx';
import { PageContent } from '~/design-system/layouts/PageContent.tsx';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle.tsx';
import { Submissions } from '~/domains/cfp-submissions/Submissions.ts';
import { requireSession } from '~/libs/auth/session.ts';

import { ProposalsList } from './__components/ProposalsList.tsx';
import { useEvent } from './_layout.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const proposals = await Submissions.for(userId, params.event).list();
  return json(proposals);
};

export default function EventSpeakerProposalsRoute() {
  const { event } = useEvent();
  const proposals = useLoaderData<typeof loader>();

  return (
    <>
      <PageHeaderTitle title="Your proposals" subtitle="All your draft and submitted proposals for the event.">
        {event.cfpState === 'OPENED' && <ButtonLink to="../submission">Submit a proposal</ButtonLink>}
      </PageHeaderTitle>

      <PageContent>
        <ProposalsList proposals={proposals} />
      </PageContent>
    </>
  );
}
