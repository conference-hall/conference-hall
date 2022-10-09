import { ExclamationCircleIcon } from '@heroicons/react/20/solid';
import { useCatch, useLoaderData } from '@remix-run/react';
import { Container } from '~/design-system/Container';
import { useEvent } from '../../$eventSlug';
import { ButtonLink } from '../../../design-system/Buttons';
import { IconLabel } from '../../../design-system/IconLabel';
import { Markdown } from '../../../design-system/Markdown';
import { H2, H3 } from '../../../design-system/Typography';
import type { ActionFunction, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { sessionRequired } from '../../../services/auth/auth.server';
import { getSpeakerProposal, removeCoSpeakerFromProposal } from '../../../services/events/proposals.server';
import { mapErrorToResponse } from '../../../services/errors';
import { EventProposalDeleteButton } from '../../../components/EventProposalDelete';
import Badge from '../../../design-system/Badges';
import { getLevel } from '../../../utils/levels';
import { getLanguage } from '../../../utils/languages';
import { CoSpeakersList, InviteCoSpeakerButton } from '../../../components/CoSpeaker';

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  const proposalId = params.id!;
  const proposal = await getSpeakerProposal(proposalId, uid).catch(mapErrorToResponse);
  return json(proposal);
};

export const action: ActionFunction = async ({ request, params }) => {
  const { uid } = await sessionRequired(request);
  const proposalId = params.id!;
  const form = await request.formData();
  try {
    const action = form.get('_action');
    if (action === 'remove-speaker') {
      const speakerId = form.get('_speakerId')?.toString() as string;
      await removeCoSpeakerFromProposal(uid, proposalId, speakerId);
      return null;
    }
  } catch (err) {
    mapErrorToResponse(err);
  }
};

export default function EventSpeakerProposalRoute() {
  const event = useEvent();
  const proposal = useLoaderData<typeof loader>();

  return (
    <Container className="my-4 sm:my-8">
      <div className="flex flex-col flex-wrap sm:flex-row sm:items-center sm:justify-between">
        <div>
          <H2>{proposal.title}</H2>
          <div className="mt-2 flex gap-2">
            {proposal.level && <Badge color="indigo">{getLevel(proposal.level)}</Badge>}
            {proposal.languages.map((language) => (
              <Badge key={language} color="indigo">
                {getLanguage(language)}
              </Badge>
            ))}
          </div>
        </div>

        {event.cfpState === 'OPENED' && (
          <div className="mt-4 flex flex-col justify-between gap-4 sm:mt-0 sm:flex-shrink-0 sm:flex-row">
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
        <IconLabel icon={ExclamationCircleIcon} className="mt-8 text-sm text-yellow-600">
          This proposal is still in draft. Don't forget to submit it.
        </IconLabel>
      )}

      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <div className="rounded-lg border border-gray-200 p-4 sm:w-2/3">
          <H3>Abstract</H3>
          <Markdown source={proposal.abstract} className="mt-2" />
          {proposal.references && (
            <>
              <H3 className="mt-8">References</H3>
              <Markdown source={proposal.references} className="mt-2" />
            </>
          )}
        </div>
        <div className="sm:w-1/3">
          <div className="rounded-lg border border-gray-200 p-4">
            <H3>Speakers</H3>
            <CoSpeakersList speakers={proposal.speakers} showRemoveAction={event.cfpState === 'OPENED'} />
            {event.cfpState === 'OPENED' && (
              <InviteCoSpeakerButton to="PROPOSAL" id={proposal.id} invitationLink={proposal.invitationLink} />
            )}
          </div>
          <dl className="mt-4 rounded-lg border border-gray-200 p-4">
            <H3 as="dt">Formats</H3>
            <dd className="mt-4 text-sm text-gray-900">{proposal.formats.map(({ name }) => name).join(', ') || '—'}</dd>
            <H3 as="dt" className="mt-8">
              Categories
            </H3>
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
