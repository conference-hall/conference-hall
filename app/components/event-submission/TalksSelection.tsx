import { ChevronRightIcon } from '@heroicons/react/solid';
import { Link } from 'remix';

type TalksSelectionProps = {
  talks: Array<{
    id: string;
    title: string;
    speakers: Array<{
      id: string;
      name: string | null;
      photoURL?: string | null;
    }>;
  }>;
};

export function TalksSelection({ talks }: TalksSelectionProps) {
  return (
    <ul role="list" className="border-t border-gray-200 divide-y divide-gray-200">
      {talks.map((talk) => (
        <li key={talk.id}>
          <Link to={`talk/${talk.id}`} className="block hover:bg-gray-50">
            <div className="px-4 py-4 flex items-center sm:px-6">
              <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                <div className="truncate">
                  <p className="font-medium text-sm text-indigo-600 truncate">{talk.title}</p>
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
  );
}
