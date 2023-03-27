import invariant from 'tiny-invariant';
import { useCatch, useLoaderData } from '@remix-run/react';
import { Container } from '~/design-system/Container';
import { useEvent } from '../$event/route';
import { Markdown } from '../../design-system/Markdown';
import { H2, H3 } from '../../design-system/Typography';
import type { ActionFunction, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { sessionRequired } from '../../libs/auth/auth.server';
import { mapErrorToResponse } from '../../libs/errors';
import Badge from '../../design-system/Badges';
import { getLevel } from '../../utils/levels';
import { getLanguage } from '../../utils/languages';
import { CoSpeakersList, InviteCoSpeakerButton } from '../../shared-components/proposal-forms/CoSpeaker';
import { ProposalStatusPanel } from '~/routes/$event.proposals.$proposal._index/components/ProposalStatusPanel';
import { getSpeakerProposal } from '~/shared-server/proposals/get-speaker-proposal.server';
import { removeCoSpeakerFromProposal } from '~/shared-server/proposals/remove-co-speaker.server';

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  invariant(params.proposal, 'Invalid proposal id');

  const proposal = await getSpeakerProposal(params.proposal, uid).catch(mapErrorToResponse);
  return json(proposal);
};

export const action: ActionFunction = async ({ request, params }) => {
  const { uid } = await sessionRequired(request);
  invariant(params.proposal, 'Invalid proposal id');
  const form = await request.formData();

  try {
    const action = form.get('_action');
    if (action === 'remove-speaker') {
      const speakerId = form.get('_speakerId')?.toString() as string;
      await removeCoSpeakerFromProposal(uid, params.proposal, speakerId);
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
      <H2>Proposal "{proposal.title}"</H2>
      <ProposalStatusPanel proposal={proposal} event={event} />

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="rounded-lg border border-gray-200 p-4 sm:w-2/3">
          <div className="flex gap-2">
            {proposal.level && <Badge>{getLevel(proposal.level)}</Badge>}
            {proposal.languages.map((language) => (
              <Badge key={language}>{getLanguage(language)}</Badge>
            ))}
          </div>
          <Markdown source={proposal.abstract} className="mt-3" />
          {proposal.references && (
            <>
              <H3>References</H3>
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
            <H3 as="dt">Categories</H3>
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
