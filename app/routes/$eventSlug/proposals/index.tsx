import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Container } from '~/design-system/Container';
import { useEvent } from '../../$eventSlug';
import { ProposalsList } from '~/components/speaker-proposals/ProposalsList';
import { H2, Text } from '~/design-system/Typography';
import { sessionRequired } from '~/services/auth/auth.server';
import { listSpeakerProposals } from '~/services/events/proposals/list-speaker-proposals.server';
import type { UnpackData } from 'domain-functions';
import { fromErrors } from '~/services/errors';

export type EventProposals = UnpackData<typeof listSpeakerProposals>;

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  const result = await listSpeakerProposals({ speakerId: uid, ...params });
  if (!result.success) {
    throw fromErrors(result);
  }
  return json(result.data);
};

export default function EventSpeakerProposalsRoute() {
  const event = useEvent();
  const proposals = useLoaderData<typeof loader>();

  return (
    <Container className="mt-4 sm:my-8">
      <div>
        <H2>Your proposals</H2>
        <Text variant="secondary" className="mt-1">
          All your draft and submitted proposals for the event
        </Text>
      </div>
      <div className="my-8">
        <ProposalsList proposals={proposals} cfpState={event.cfpState} />
      </div>
    </Container>
  );
}
