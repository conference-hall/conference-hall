import { CalendarIcon, ExclamationIcon } from '@heroicons/react/solid';
import { formatRelative } from 'date-fns';
import { useLoaderData } from 'remix';
import { Container } from '~/components/layout/Container';
import { ButtonLink } from '../../components/Buttons';
import { IconLabel } from '../../components/IconLabel';
import { Markdown } from '../../components/MarkdownRender';
import { loadSpeakerProposal, SpeakerProposal } from '../../features/event-speaker-proposals/proposal.server';

export const loader = loadSpeakerProposal;

export default function EventSpeakerProposalRoute() {
  const proposal = useLoaderData<SpeakerProposal>();
  return (
    <Container className="mt-8">
      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 -ml-4 -mt-4 flex justify-between items-center flex-wrap sm:flex-nowrap">
          <div className="ml-4 mt-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">{proposal.title}</h3>
            <div className="mt-1 text-sm text-gray-500">
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
          <div className="ml-4 mt-4 flex-shrink-0">
            {proposal.status === 'DRAFT' ? (
              <ButtonLink to={`../submission/${proposal.talkId}`}>Submit proposal</ButtonLink>
            ) : (
              <ButtonLink to="edit">Edit proposal</ButtonLink>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
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

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
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

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
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
