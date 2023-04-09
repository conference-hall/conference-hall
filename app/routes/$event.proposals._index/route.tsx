import invariant from 'tiny-invariant';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Container } from '~/design-system/Container';
import { useEvent } from '../$event/route';
import { ProposalsList } from '~/routes/$event.proposals._index/components/ProposalsList';
import { sessionRequired } from '~/libs/auth/auth.server';
import { mapErrorToResponse } from '~/libs/errors';
import { listSpeakerProposals } from './server/list-speaker-proposals.server';
import { ButtonLink } from '~/design-system/Buttons';
import { Header } from '~/shared-components/Header';

export type EventProposals = Awaited<ReturnType<typeof listSpeakerProposals>>;

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  invariant(params.event, 'Invalid event slug');

  const proposals = await listSpeakerProposals(params.event, uid).catch(mapErrorToResponse);
  return json(proposals);
};

export default function EventSpeakerProposalsRoute() {
  const event = useEvent();
  const proposals = useLoaderData<typeof loader>();

  return (
    <>
      <Header title="Your proposals" subtitle="All your draft and submitted proposals for the event.">
        {event.cfpState === 'OPENED' && <ButtonLink to="../submission">Submit a proposal</ButtonLink>}
      </Header>

      <Container className="mt-4 sm:my-8">
        <ProposalsList proposals={proposals} cfpState={event.cfpState} />
      </Container>
    </>
  );
}
