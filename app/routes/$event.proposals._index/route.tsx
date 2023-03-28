import invariant from 'tiny-invariant';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Container } from '~/design-system/Container';
import { useEvent } from '../$event/route';
import { ProposalsList } from '~/routes/$event.proposals._index/components/ProposalsList';
import { H2, Subtitle } from '~/design-system/Typography';
import { sessionRequired } from '~/libs/auth/auth.server';
import { mapErrorToResponse } from '~/libs/errors';
import { listSpeakerProposals } from './server/list-speaker-proposals.server';
import { ButtonLink } from '~/design-system/Buttons';

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
    <Container className="mt-4 sm:my-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <H2 mb={1}>Your proposals</H2>
          <Subtitle>All your draft and submitted proposals for the event</Subtitle>
        </div>
        {event.cfpState === 'OPENED' && <ButtonLink to="../submission">Submit a proposal</ButtonLink>}
      </div>

      <div className="my-8">
        <ProposalsList proposals={proposals} cfpState={event.cfpState} />
      </div>
    </Container>
  );
}
