import { CalendarIcon, ExclamationIcon } from '@heroicons/react/solid';
import { formatRelative } from 'date-fns';
import { useCatch, useLoaderData } from '@remix-run/react';
import { Container } from '~/components-ui/Container';
import { useEvent } from '../../$eventSlug';
import { ButtonLink } from '../../../components-ui/Buttons';
import { IconLabel } from '../../../components-ui/IconLabel';
import { Markdown } from '../../../components-ui/Markdown';
import { H2 } from '../../../components-ui/Typography';
import { json, LoaderFunction } from '@remix-run/node';
import { requireUserSession } from '../../../services/auth/auth.server';
import { getSpeakerProposal, SpeakerProposal } from '../../../services/events/proposals.server';
import { mapErrorToResponse } from '../../../services/errors';
import { DeleteProposalButton } from '../../../components-app/DeleteProposalButton';

export const loader: LoaderFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const proposalId = params.id!;
  try {
    const proposal = await getSpeakerProposal(proposalId, uid);
    return json<SpeakerProposal>(proposal);
  } catch (err) {
    mapErrorToResponse(err);
  }
};

export default function EventSpeakerProposalRoute() {
  const event = useEvent();
  const proposal = useLoaderData<SpeakerProposal>();

  return (
    <Container className="mt-8">
      <div className="flex justify-between items-center flex-wrap sm:flex-nowrap">
        <div>
          <H2>{proposal.title}</H2>
          <div className="mt-1">
            {proposal.status === 'DRAFT' ? (
              <IconLabel icon={ExclamationIcon} className="text-sm text-yellow-600">
                This proposal is still in draft. Don't forget to submit it.
              </IconLabel>
            ) : (
              <IconLabel icon={CalendarIcon} className="text-sm text-gray-500" iconClassName="text-gray-400">
                Submitted&nbsp;
                <time dateTime={proposal.createdAt}>{formatRelative(new Date(proposal.createdAt), new Date())}</time>
              </IconLabel>
            )}
          </div>
        </div>

        {event.cfpState === 'OPENED' && (
          <div className="flex-shrink-0 space-x-4">
            <DeleteProposalButton />
            {proposal.status === 'DRAFT' ? (
              <ButtonLink to={`../submission/${proposal.talkId}`}>Submit proposal</ButtonLink>
            ) : (
              <ButtonLink to="edit">Edit proposal</ButtonLink>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 bg-white border border-gray-200 overflow-hidden sm:rounded-lg">
        <div className="px-4 py-10 sm:px-6">
          <ul role="list" className="divide-y divide-gray-200 sm:col-span-2">
            {proposal.speakers.map((speaker) => (
              <li key={speaker.id} className="flex items-center">
                <img
                  className="h-10 w-10 rounded-full"
                  src={speaker.photoURL || 'http://placekitten.com/100/100'}
                  alt={speaker.name || 'Speaker'}
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{speaker.name}</p>
                </div>
              </li>
            ))}
          </ul>
          <Markdown source={proposal.abstract} className="mt-4" />
        </div>

        <div className="border-t border-gray-200 px-4 py-10 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Language</dt>
              <dd className="mt-1 text-sm text-gray-900">{proposal.languages || '—'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Level</dt>
              <dd className="mt-1 text-sm text-gray-900">{proposal.level || '—'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Formats</dt>
              <dd className="mt-1 text-sm text-gray-900">{proposal.formats.join(', ') || '—'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Categories</dt>
              <dd className="mt-1 text-sm text-gray-900">{proposal.categories.join(', ') || '—'}</dd>
            </div>
          </dl>
        </div>

        <div className="border-t border-gray-200 px-4 py-10 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">References</dt>
              <Markdown source={proposal.references || '—'} component="dd" className="mt-1" />
            </div>
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
