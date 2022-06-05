import { ActionFunction, json, LoaderFunction } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { Container } from '~/components-ui/Container';
import Badge from '../../../components-ui/Badges';
import { Button, ButtonLink } from '../../../components-ui/Buttons';
import { Markdown } from '../../../components-ui/Markdown';
import { H1, H2, Text } from '../../../components-ui/Typography';
import { EventActivity } from '../../../components-app/SpeakerActivities';
import { requireUserSession } from '../../../services/auth/auth.server';
import { getLanguage } from '../../../utils/languages';
import { getLevel } from '../../../utils/levels';
import { TrashIcon } from '@heroicons/react/outline';
import { archiveTalk, getTalk, removeCoSpeaker, restoreTalk, SpeakerTalk } from '../../../services/speakers/talks.server';
import { mapErrorToResponse } from '../../../services/errors';
import TalkActions from '../../../components-app/TalkActions';
import { AddCoSpeakerButton } from '../../../components-app/CoSpeaker';

export const loader: LoaderFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  try {
    const talk = await getTalk(uid, params.id);
    return json<SpeakerTalk>(talk);
  } catch(err) {
    mapErrorToResponse(err);
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const talkId = params.id;
  if (!talkId) return null;
  const form = await request.formData();
  const action = form.get('_action');
  if (action === 'remove-speaker') {
    const speakerId = form.get('_speakerId')?.toString();
    if (speakerId) await removeCoSpeaker(uid, talkId, speakerId);
  } else if (action === 'archive-talk') {
    await archiveTalk(uid, talkId);
  } else if (action === 'restore-talk') {
    await restoreTalk(uid, talkId);
  }
  return null;
};

export default function SpeakerTalkRoute() {
  const talk = useLoaderData<SpeakerTalk>();

  return (
    <Container className="mt-8">
      <div className="flex justify-between items-center flex-wrap sm:flex-nowrap">
        <div>
          <H1>{talk.title}</H1>
          <div className="mt-2 flex gap-2">
            <Badge color="indigo">{getLevel(talk.level)}</Badge>
            {talk.languages.map((language) => (
              <Badge key={language} color="indigo">
                {getLanguage(language)}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex-shrink-0 space-x-4">
          {!talk.archived && <TalkActions />}
          {!talk.archived && <ButtonLink to={`/search?talkId=${talk.id}`}>Submit</ButtonLink>}
          {talk.archived && (
            <Form method="post">
              <input type="hidden" name="_action" value="restore-talk" />
              <Button type="submit" variant="secondary">
                Restore
              </Button>
            </Form>
          )}
        </div>
      </div>

      <div className="flex flex-row gap-4 mt-8">
        <div className="w-2/3 bg-white border border-gray-200 overflow-hidden sm:rounded-lg p-4">
          <H2>Abstract</H2>
          <Markdown source={talk.abstract} className="mt-2" />
          <H2 className="mt-8">References</H2>
          <Markdown source={talk.references} className="mt-2" />
        </div>
        <div className="w-1/3">
          <div className="bg-white border border-gray-200 overflow-hidden sm:rounded-lg p-4">
            <H2>Speakers</H2>
            {talk.speakers.map((speaker) => (
              <div key={speaker.id} className="mt-4 flex justify-between items-center">
                <div className="flex items-center">
                  <img
                    className="inline-block h-9 w-9 rounded-full"
                    src={speaker.photoURL || 'http://placekitten.com/100/100'}
                    alt={speaker.name || 'Speaker'}
                  />
                  <div className="ml-3">
                    <Text>{speaker.name}</Text>
                    <Text variant="secondary" size="xs">
                      {speaker.isOwner ? 'Owner' : 'Co-speaker'}
                    </Text>
                  </div>
                </div>
                <div>
                  {!speaker.isOwner && (
                    <Form method="post">
                      <input type="hidden" name="_action" value="remove-speaker" />
                      <input type="hidden" name="_speakerId" value={speaker.id} />
                      {!talk.archived && (
                        <button
                          type="submit"
                          className="inline-flex items-center p-1 border border-transparent rounded-full text-gray-400 bg-white hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                          <TrashIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                      )}
                    </Form>
                  )}
                </div>
              </div>
            ))}
            {!talk.archived && <AddCoSpeakerButton />}
          </div>
          <div className="bg-white border border-gray-200 overflow-hidden sm:rounded-lg p-4 mt-4">
            <H2>Submissions</H2>
            <div className="mt-4">
              {talk.proposals.map((proposal) => (
                <EventActivity
                  key={proposal.eventSlug}
                  eventSlug={proposal.eventSlug}
                  eventName={proposal.eventName}
                  date={proposal.date}
                  status={proposal.status}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
