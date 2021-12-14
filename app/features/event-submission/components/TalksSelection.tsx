import { ChevronRightIcon, ExclamationIcon } from '@heroicons/react/solid';
import { Link } from 'remix';
import { IconLabel } from '../../../components/IconLabel';

type TalksSelectionProps = {
  talks: Array<{
    id: string;
    title: string;
    isDraft: boolean;
    speakers: Array<{
      id: string;
      name: string | null;
      photoURL?: string | null;
    }>;
  }>;
};

export function TalksSelection({ talks }: TalksSelectionProps) {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {talks.map((talk) => (
          <li key={talk.id}>
            <Link to={talk.id} className="block hover:bg-gray-50">
              <div className="px-4 py-4 flex items-center sm:px-6">
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                  <div className="truncate">
                    <div className="flex text-sm">
                      <p className="font-medium text-indigo-600 truncate">{talk.title}</p>
                    </div>
                    {talk.isDraft && (
                      <div className="mt-2 flex">
                        <IconLabel icon={ExclamationIcon} className="text-sm text-yellow-600">
                          This proposal is still in draft. Don't forget to submit it.
                        </IconLabel>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                    <div className="flex overflow-hidden -space-x-1">
                      {talk.speakers.map((speaker) => (
                        <img
                          key={speaker.id}
                          className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                          src={speaker.photoURL || 'http://placekitten.com/100/100'}
                          alt={speaker.name || 'co-speaker'}
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
