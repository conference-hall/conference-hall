import { json, LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Container } from '~/components-ui/Container';
import { useEvent } from '../../$eventSlug';
import { EventProposalsList } from '../../../components-app/EventProposalsList';
import { H2, Text } from '../../../components-ui/Typography';
import { requireUserSession } from '../../../services/auth/auth.server';
import { mapErrorToResponse } from '../../../services/errors';
import { fetchSpeakerProposals } from '../../../services/events/proposals.server';

export const loader = async ({ request, params }: LoaderArgs) => {
  const uid = await requireUserSession(request);
  const slug = params.eventSlug!;
  const proposals = await fetchSpeakerProposals(slug, uid).catch(mapErrorToResponse);
  return json(proposals);
};

export default function EventSpeakerProposalsRoute() {
  const event = useEvent();
  const proposals = useLoaderData<typeof loader>();

  return (
    <Container className="mt-8">
      <div>
        <H2>Your proposals</H2>
        <Text variant="secondary" className="mt-1">
          All your draft and submitted proposals for the event
        </Text>
      </div>
      <div className="mt-8">
        <EventProposalsList proposals={proposals} cfpState={event.cfpState} />
      </div>
    </Container>
  );
}
