import formatRelative from 'date-fns/formatRelative';
import { CalendarIcon, ExclamationIcon } from '@heroicons/react/solid';
import { Link } from '@remix-run/react';
import { IconLabel } from '../design-system/IconLabel';
import { Container } from '../design-system/Container';
import type { CfpState } from '../utils/event';
import { CfpLabel } from './CfpInfo';

type Props = {
  proposals: Array<{
    id: string;
    title: string;
    talkId: string | null;
    status: string;
    createdAt: string;
    speakers: Array<{
      id: string;
      name: string | null;
      photoURL?: string | null;
    }>;
  }>;
  cfpState: CfpState;
};

export function EventProposalsList({ proposals, cfpState }: Props) {
  if (proposals.length === 0) {
    return <EmptyState cfpState={cfpState} />;
  }

  return (
    <ul aria-label="Proposals list" className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {proposals.map((proposal) => (
        <li key={proposal.id} className="col-span-1 rounded-lg border border-gray-200 bg-white">
          <Link to={proposal.id} className="block rounded-lg hover:bg-indigo-50">
            <div className="flex h-40 flex-col justify-between px-4 py-4 sm:px-6">
              <div>
                <p className="truncate text-base font-semibold text-indigo-600">{proposal.title}</p>

                <div className="mt-2 flex items-center -space-x-1 overflow-hidden">
                  {proposal.speakers.map((speaker) => (
                    <img
                      key={speaker.id}
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                      src={speaker.photoURL || 'http://placekitten.com/100/100'}
                      alt={speaker.name || 'Speaker'}
                    />
                  ))}
                  <span className="truncate pl-3 text-sm text-gray-500">
                    by {proposal.speakers.map((s) => s.name).join(', ')}
                  </span>
                </div>
              </div>

              <div>
                {proposal.status === 'DRAFT' ? (
                  <IconLabel icon={ExclamationIcon} className="text-sm text-yellow-600">
                    Draft proposal, don't forget to submit it.
                  </IconLabel>
                ) : (
                  <IconLabel icon={CalendarIcon} className="text-sm text-gray-500" iconClassName="text-gray-400">
                    Submitted&nbsp;
                    <time dateTime={proposal.createdAt}>
                      {formatRelative(new Date(proposal.createdAt), new Date())}
                    </time>
                  </IconLabel>
                )}
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

type EmptyStateProps = { cfpState: CfpState };

export function EmptyState({ cfpState }: EmptyStateProps) {
  return (
    <Container className="mt-8 flex flex-col items-center py-8">
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        />
      </svg>
      {cfpState === 'OPENED' ? (
        <>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No submitted proposals yet!</h3>
          <p className="mt-1 text-sm text-gray-600">Get started by submitting your first proposal.</p>
        </>
      ) : (
        <>
          <p className="mt-4">
            <CfpLabel cfpState={cfpState} />
          </p>
        </>
      )}
    </Container>
  );
}
