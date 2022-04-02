import { CalendarIcon } from '@heroicons/react/solid';
import { formatRelative } from 'date-fns';
import { useLoaderData, Link } from 'remix';
import { IconLabel } from '../../../components/IconLabel';
import { Container } from '../../../components/layout/Container';
import { H2, Text } from '../../../components/Typography';
import { loadSpeakerTalks, SpeakerTalks } from '../../../features/speaker-talks/list-talks.server';

export const loader = loadSpeakerTalks;

export default function TalksRoute() {
  const talks = useLoaderData<SpeakerTalks>();

  return (
    <Container className="mt-8">
      <div className="flex justify-between items-center flex-wrap sm:flex-nowrap">
        <div>
          <H2>Your talks</H2>
          <Text variant="secondary" className="mt-1">
            All your talk abstracts.
          </Text>
        </div>
      </div>
      <div className="mt-8">
        <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {talks.map((talk) => (
            <li key={talk.id} className="col-span-1 bg-white rounded-lg border border-gray-200">
              <Link to={talk.id} className="block hover:bg-indigo-50 rounded-lg">
                <div className="px-4 py-4 sm:px-6 h-40 flex flex-col justify-between">
                  <div>
                    <p className="text-base font-semibold text-indigo-600 truncate">{talk.title}</p>
                    <div className="mt-2 flex items-center overflow-hidden -space-x-1">
                      {talk.speakers.map((speaker) => (
                        <img
                          key={speaker.id}
                          className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                          src={speaker.photoURL || 'http://placekitten.com/100/100'}
                          alt={speaker.name || 'Speaker'}
                        />
                      ))}
                      <span className="pl-3 text-sm text-gray-500 truncate">
                        by {talk.speakers.map((s) => s.name).join(', ')}
                      </span>
                    </div>
                  </div>
                  <div>
                    <IconLabel icon={CalendarIcon} className="text-sm text-gray-500" iconClassName="text-gray-400">
                      Created&nbsp;
                      <time dateTime={talk.createdAt}>
                        {formatRelative(new Date(talk.createdAt), new Date())}
                      </time>
                    </IconLabel>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Container>
  );
}
