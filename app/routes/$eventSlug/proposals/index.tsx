import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Container } from '~/design-system/Container';
import { useEvent } from '../../$eventSlug';
import { ProposalsList } from '~/components/speaker-proposals/ProposalsList';
import { H2, Text } from '~/design-system/Typography';
import { sessionRequired } from '~/services/auth/auth.server';
import { mapErrorToResponse } from '~/services/errors';
import { listSpeakerProposals } from '~/services/event-proposals/list.server';

export type EventProposals = Awaited<ReturnType<typeof listSpeakerProposals>>;

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  const slug = params.eventSlug!;
  const proposals = await listSpeakerProposals(slug, uid).catch(mapErrorToResponse);
  return json(proposals);
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
