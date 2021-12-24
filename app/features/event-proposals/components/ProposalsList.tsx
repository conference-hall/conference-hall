import formatRelative from 'date-fns/formatRelative';
import { CalendarIcon, ChevronRightIcon, ExclamationIcon } from '@heroicons/react/solid';
import { Link } from 'remix';
import { IconLabel } from '../../../components/IconLabel';

type ProposalsListProps = {
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
};

export function ProposalsList({ proposals }: ProposalsListProps) {
  return (
    <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {proposals.map((proposal) => (
        <li key={proposal.id} className="col-span-1 bg-white rounded-lg border border-gray-200">
          <Link to={proposal.id} className="block hover:bg-indigo-50 rounded-lg">
            <div className="px-4 py-4 sm:px-6 h-40 flex flex-col justify-between">
              <div>
                <p className="text-base font-semibold text-indigo-600 truncate">{proposal.title}</p>

                <div className="mt-2 flex items-center overflow-hidden -space-x-1">
                  {proposal.speakers.map((speaker) => (
                    <img
                      key={speaker.id}
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                      src={speaker.photoURL || 'http://placekitten.com/100/100'}
                      alt={speaker.name || 'Speaker'}
                    />
                  ))}
                  <span className="pl-3 text-sm test-gray-500 truncate">
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
