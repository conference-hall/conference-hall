import { ExclamationIcon } from '@heroicons/react/solid';
import { useCatch, useLoaderData } from '@remix-run/react';
import { Container } from '~/design-system/Container';
import { useEvent } from '../../$eventSlug';
import { ButtonLink } from '../../../design-system/Buttons';
import { IconLabel } from '../../../design-system/IconLabel';
import { Markdown } from '../../../design-system/Markdown';
import { H1, H2 } from '../../../design-system/Typography';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { sessionRequired } from '../../../services/auth/auth.server';
import { getSpeakerProposal } from '../../../services/events/proposals.server';
import { mapErrorToResponse } from '../../../services/errors';
import { EventProposalDeleteButton } from '../../../components/EventProposalDelete';
import Badge from '../../../design-system/Badges';
import { getLevel } from '../../../utils/levels';
import { getLanguage } from '../../../utils/languages';
import { CoSpeakersList, InviteCoSpeakerButton } from '../../../components/CoSpeaker';

export const loader = async ({ request, params }: LoaderArgs) => {
  const uid = await sessionRequired(request);
  const proposalId = params.id!;
  const proposal = await getSpeakerProposal(proposalId, uid).catch(mapErrorToResponse);
  return json(proposal);
};

export default function EventSpeakerProposalRoute() {
  const event = useEvent();
  const proposal = useLoaderData<typeof loader>();

  return (
    <Container className="mt-8">
      <div className="flex flex-wrap items-center justify-between sm:flex-nowrap">
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

      <div className="mt-8 flex flex-row gap-4">
        <div className="w-2/3 overflow-hidden border border-gray-200 bg-white p-4 sm:rounded-lg">
          <H2>Abstract</H2>
          <Markdown source={proposal.abstract} className="mt-2" />
          <H2 className="mt-8">References</H2>
          <Markdown source={proposal.references} className="mt-2" />
        </div>
        <div className="w-1/3">
          <div className="overflow-hidden border border-gray-200 bg-white p-4 sm:rounded-lg">
            <H2>Speakers</H2>
            <CoSpeakersList speakers={proposal.speakers} showRemoveAction={event.cfpState === 'OPENED'} />
            {event.cfpState === 'OPENED' && (
              <InviteCoSpeakerButton to="PROPOSAL" id={proposal.id} invitationLink={proposal.invitationLink} />
            )}
          </div>
          <dl className="mt-4 overflow-hidden border border-gray-200 bg-white p-4 sm:rounded-lg">
            <H2 as="dt">Formats</H2>
            <dd className="mt-4 text-sm text-gray-900">{proposal.formats.map(({ name }) => name).join(', ') || '—'}</dd>
            <H2 as="dt" className="mt-8">
              Categories
            </H2>
            <dd className="mt-4 text-sm text-gray-900">
              {proposal.categories.map(({ name }) => name).join(', ') || '—'}
            </dd>
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
