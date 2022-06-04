import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Container } from '~/components/layout/Container';
import { useEvent } from '../../$eventSlug';
import { ButtonLink } from '../../../components/Buttons';
import { H2, Text } from '../../../components/Typography';
import { requireUserSession } from '../../../services/auth/auth.server';
import { mapErrorToResponse } from '../../../services/errors';
import { fetchSpeakerProposals, SpeakerProposals } from '../../../services/events/proposals.server';
import { ProposalsEmptyState } from '../components/ProposalsEmptyState';
import { ProposalsList } from '../components/ProposalsList';

export const loader: LoaderFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const slug = params.eventSlug!;
  try {
    const proposals = await fetchSpeakerProposals(slug, uid);
    return json<SpeakerProposals>(proposals);
  } catch (err) {
    mapErrorToResponse(err);
  }
};

export default function EventSpeakerProposalsRoute() {
  const event = useEvent();
  const proposals = useLoaderData<SpeakerProposals>();

  if (proposals.length === 0) {
    return <ProposalsEmptyState cfpState={event.cfpState} />;
  }

  return (
    <Container className="mt-8">
      <div className="flex justify-between items-center flex-wrap sm:flex-nowrap">
        <div>
          <H2>Your proposals</H2>
          <Text variant="secondary" className="mt-1">
            All your draft and submitted proposals for the event
          </Text>
        </div>
        {event.cfpState === 'OPENED' && (
          <div className="flex-shrink-0">
            <ButtonLink to="../submission">Submit a proposal</ButtonLink>
          </div>
        )}
      </div>
      <div className="mt-8">
        <ProposalsList proposals={proposals} />
      </div>
    </Container>
  );
}
