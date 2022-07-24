import { ExclamationIcon } from '@heroicons/react/solid';
import { useCatch, useLoaderData } from '@remix-run/react';
import { Container } from '~/components-ui/Container';
import { useEvent } from '../../$eventSlug';
import { ButtonLink } from '../../../components-ui/Buttons';
import { IconLabel } from '../../../components-ui/IconLabel';
import { Markdown } from '../../../components-ui/Markdown';
import { H1, H2 } from '../../../components-ui/Typography';
import { json, LoaderArgs } from '@remix-run/node';
import { requireUserSession } from '../../../services/auth/auth.server';
import { getSpeakerProposal } from '../../../services/events/proposals.server';
import { mapErrorToResponse } from '../../../services/errors';
import { EventProposalDeleteButton } from '../../../components-app/EventProposalDelete';
import Badge from '../../../components-ui/Badges';
import { getLevel } from '../../../utils/levels';
import { getLanguage } from '../../../utils/languages';
import { CoSpeakersList, InviteCoSpeakerButton } from '../../../components-app/CoSpeaker';

export const loader = async ({ request, params }: LoaderArgs) => {
  const uid = await requireUserSession(request);
  const proposalId = params.id!;
  const proposal = await getSpeakerProposal(proposalId, uid).catch(mapErrorToResponse);
  return json(proposal);
};

export default function EventSpeakerProposalRoute() {
  const event = useEvent();
  const proposal = useLoaderData<typeof loader>();

  return (
    <Container className="mt-8">
      <div className="flex justify-between items-center flex-wrap sm:flex-nowrap">
        <div>
          <H1>{proposal.title}</H1>
          <div className="mt-2 flex gap-2">
            <Badge color="indigo">{getLevel(proposal.level)}</Badge>
            {proposal.languages.map((language) => (
              <Badge key={language} color="indigo">
                {getLanguage(language)}
              </Badge>
            ))}
          </div>
        </div>

        {event.cfpState === 'OPENED' && (
          <div className="flex-shrink-0 space-x-4">
            <EventProposalDeleteButton />
            {proposal.status === 'DRAFT' ? (
              <ButtonLink to={`../submission/${proposal.talkId}`}>Submit proposal</ButtonLink>
            ) : (
              <ButtonLink to="edit">Edit proposal</ButtonLink>
            )}
          </div>
        )}
      </div>

      {proposal.status === 'DRAFT' && (
        <div className="mt-8">
          <IconLabel icon={ExclamationIcon} className="text-sm text-yellow-600">
            This proposal is still in draft. Don't forget to submit it.
          </IconLabel>
        </div>
      )}

      <div className="flex flex-row gap-4 mt-8">
        <div className="w-2/3 bg-white border border-gray-200 overflow-hidden sm:rounded-lg p-4">
          <H2>Abstract</H2>
          <Markdown source={proposal.abstract} className="mt-2" />
          <H2 className="mt-8">References</H2>
          <Markdown source={proposal.references} className="mt-2" />
        </div>
        <div className="w-1/3">
          <div className="bg-white border border-gray-200 overflow-hidden sm:rounded-lg p-4">
            <H2>Speakers</H2>
            <CoSpeakersList speakers={proposal.speakers} showRemoveAction={event.cfpState === 'OPENED'} />
            {event.cfpState === 'OPENED' && (
              <InviteCoSpeakerButton to="PROPOSAL" id={proposal.id} invitationLink={proposal.invitationLink} />
            )}
          </div>
          <dl className="bg-white border border-gray-200 overflow-hidden sm:rounded-lg p-4 mt-4">
            <H2 as="dt">Formats</H2>
            <dd className="mt-4 text-sm text-gray-900">{proposal.formats.join(', ') || '—'}</dd>
            <H2 as="dt" className="mt-8">
              Categories
            </H2>
            <dd className="mt-4 text-sm text-gray-900">{proposal.categories.join(', ') || '—'}</dd>
          </dl>
        </div>
      </div>
    </Container>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  return (
    <Container className="mt-8 px-8 py-32 text-center">
      <h1 className="text-8xl font-black text-indigo-400">{caught.status}</h1>
      <p className="mt-10 text-4xl font-bold text-gray-600">{caught.data}</p>
    </Container>
  );
}
