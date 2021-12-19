import formatRelative from 'date-fns/formatRelative';
import { CalendarIcon, ChevronRightIcon, ExclamationIcon } from '@heroicons/react/solid';
import { Link } from 'remix';
import { IconLabel } from '../../../components/IconLabel';

type ProposalsListProps = {
  proposals: Array<{
    id: string;
    title: string;
    talkId: string;
    status: string;
    createdAt: string;
    speakers: Array<{
      id: string;
      name: string | null;
      photoURL?: string | null;
    }>;
  }>;
};

export function ProposalsList({ proposals }: ProposalsListProps) {
  return (
    <div className="bg-white border border-gray-200 overflow-hidden sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {proposals.map((proposal) => (
          <li key={proposal.id}>
            <Link to={proposal.id} className="block hover:bg-gray-50">
              <div className="px-4 py-4 flex items-center sm:px-6">
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                  <div className="truncate">
                    <div className="flex text-sm">
                      <p className="font-medium text-indigo-600 truncate">{proposal.title}</p>
                    </div>
                    <div className="mt-2 flex">
                      {proposal.status === 'DRAFT' ? (
                        <IconLabel icon={ExclamationIcon} className="text-sm text-yellow-600">
                          This proposal is still in draft. Don't forget to submit it.
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
                  <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                    <div className="flex overflow-hidden -space-x-1">
                      {proposal.speakers.map((speaker) => (
                        <img
                          key={speaker.id}
                          className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                          src={speaker.photoURL || 'http://placekitten.com/100/100'}
                          alt={speaker.name || 'Speaker'}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="ml-5 flex-shrink-0">
                  <ChevronRightIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
