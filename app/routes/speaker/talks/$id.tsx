import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Container } from '~/components/layout/Container';
import { ButtonLink } from '../../../components/Buttons';
import { Markdown } from '../../../components/Markdown';
import { H1 } from '../../../components/Typography';
import { requireUserSession } from '../../../features/auth/auth.server';
import { getSpeakerTalk, SpeakerTalk } from '../../../features/speaker-talks.server';
import { getLanguage } from '../../../utils/languages';
import { getLevel } from '../../../utils/levels';

export const loader: LoaderFunction =  async ({ request, params }) => {
  const uid = await requireUserSession(request);
  try {
    const talk = await getSpeakerTalk(uid, params.id);
    return json<SpeakerTalk>(talk);
  } catch {
    throw new Response('Talk not found.', { status: 404 });
  }
};

export default function SpeakerTalkRoute() {
  const talk = useLoaderData<SpeakerTalk>();

  return (
    <Container className="mt-8">
      <div className="flex justify-between items-center flex-wrap sm:flex-nowrap">
        <div>
          <H1>{talk.title}</H1>
          <div className="mt-2 flex items-center overflow-hidden -space-x-1">
            {talk.speakers.map((speaker) => (
              <img
                key={speaker.name}
                className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                src={speaker.photoURL || 'http://placekitten.com/100/100'}
                alt={speaker.name || 'Speaker'}
              />
            ))}
            <span className="pl-3 text-sm test-gray-500 truncate">
              by {talk.speakers.map((s) => s.name).join(', ')}
            </span>
          </div>
        </div>

        <div className="flex-shrink-0 space-x-4">
          <ButtonLink to="edit">Edit proposal</ButtonLink>
        </div>
      </div>

      <p>Level: {getLevel(talk.level)}</p>
      <p>Language: {getLanguage(talk.language)}</p>

      <Markdown
        source={talk.abstract}
        className="bg-white border border-gray-200 overflow-hidden sm:rounded-lg p-4 mt-4"
      />
      <Markdown
        source={talk.references}
        className="bg-white border border-gray-200 overflow-hidden sm:rounded-lg p-4 mt-4"
      />
    </Container>
  );
}
