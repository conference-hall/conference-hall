import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { ButtonLink } from '~/design-system/Buttons.tsx';
import { Container } from '~/design-system/layouts/Container.tsx';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle.tsx';
import { requireSession } from '~/libs/auth/session.ts';

import { ProposalsList } from './__components/ProposalsList.tsx';
import { listSpeakerProposals } from './__server/list-speaker-proposals.server.ts';
import { useEvent } from './_layout.tsx';

export type EventProposals = Awaited<ReturnType<typeof listSpeakerProposals>>;

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const proposals = await listSpeakerProposals(params.event, userId);
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

      <Container className="mt-4 sm:my-8">
        <ProposalsList proposals={proposals} cfpState={event.cfpState} />
      </Container>
    </>
  );
}
