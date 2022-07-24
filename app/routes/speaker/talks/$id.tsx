import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { Container } from '../../../components-ui/Container';
import Badge from '../../../components-ui/Badges';
import { Button, ButtonLink } from '../../../components-ui/Buttons';
import { Markdown } from '../../../components-ui/Markdown';
import { H1, H2 } from '../../../components-ui/Typography';
import { EventActivity } from '../../../components-app/SpeakerActivities';
import { requireUserSession } from '../../../services/auth/auth.server';
import { getLanguage } from '../../../utils/languages';
import { getLevel } from '../../../utils/levels';
import type { SpeakerTalk } from '../../../services/speakers/talks.server';
import {
  archiveTalk,
  deleteTalk,
  getTalk,
  removeCoSpeakerFromTalk,
  restoreTalk,
} from '../../../services/speakers/talks.server';
import { mapErrorToResponse } from '../../../services/errors';
import { TalkActionsMenu } from '../../../components-app/TalkActionsMenu';
import { InviteCoSpeakerButton, CoSpeakersList } from '../../../components-app/CoSpeaker';

export const loader: LoaderFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  try {
    const talk = await getTalk(uid, params.id!);
    return json<SpeakerTalk>(talk);
  } catch (err) {
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
    if (speakerId) await removeCoSpeakerFromTalk(uid, talkId, speakerId);
  } else if (action === 'archive-talk') {
    await archiveTalk(uid, talkId);
  } else if (action === 'restore-talk') {
    await restoreTalk(uid, talkId);
  } else if (action === 'delete-talk') {
    await deleteTalk(uid, talkId);
    return redirect('/speaker/talks');
  }
  return null;
};

export default function SpeakerTalkRoute() {
  const talk = useLoaderData<SpeakerTalk>();

  return (
    <Container className="mt-8">
      <div className="flex flex-wrap items-center justify-between sm:flex-nowrap">
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
          {!talk.archived && <TalkActionsMenu />}
          {!talk.archived && <ButtonLink to={`/?talkId=${talk.id}`}>Submit</ButtonLink>}
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

      <div className="mt-8 flex flex-row gap-4">
        <div className="w-2/3 overflow-hidden border border-gray-200 bg-white p-4 sm:rounded-lg">
          <H2>Abstract</H2>
          <Markdown source={talk.abstract} className="mt-2" />
          <H2 className="mt-8">References</H2>
          <Markdown source={talk.references} className="mt-2" />
        </div>
        <div className="w-1/3">
          <div className="overflow-hidden border border-gray-200 bg-white p-4 sm:rounded-lg">
            <H2>Speakers</H2>
            <CoSpeakersList speakers={talk.speakers} showRemoveAction={!talk.archived} />
            {!talk.archived && <InviteCoSpeakerButton to="TALK" id={talk.id} invitationLink={talk.invitationLink} />}
          </div>
          <div className="mt-4 overflow-hidden border border-gray-200 bg-white p-4 sm:rounded-lg">
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
