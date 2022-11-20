import type { ActionFunction, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { Container } from '../../../design-system/Container';
import Badge from '../../../design-system/Badges';
import { Button, ButtonLink } from '../../../design-system/Buttons';
import { Markdown } from '../../../design-system/Markdown';
import { H2, H3 } from '../../../design-system/Typography';
import { EventActivity } from '../../../components/SpeakerActivities';
import { sessionRequired } from '../../../services/auth/auth.server';
import { getLanguage } from '../../../utils/languages';
import { getLevel } from '../../../utils/levels';
import { removeCoSpeakerFromTalk } from '../../../services/speaker-talks/co-speaker.server';
import { mapErrorToResponse } from '../../../services/errors';
import { TalkActionsMenu } from '../../../components/TalkActionsMenu';
import { InviteCoSpeakerButton, CoSpeakersList } from '../../../components/CoSpeaker';
import { getTalk } from '~/services/speaker-talks/get-talk.server';
import { deleteTalk } from '~/services/speaker-talks/delete-talk.server';
import { archiveTalk, restoreTalk } from '~/services/speaker-talks/archive-talk.server';

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  try {
    const talk = await getTalk(uid, params.id!);
    return json(talk);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const { uid } = await sessionRequired(request);
  const talkId = params.id!;
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
  const talk = useLoaderData<typeof loader>();

  return (
    <Container className="my-4 sm:my-8">
      <div className="flex flex-col flex-wrap sm:flex-row sm:items-center sm:justify-between">
        <div>
          <H2>{talk.title}</H2>
          <div className="mt-2 flex gap-2">
            {talk.level && <Badge color="indigo">{getLevel(talk.level)}</Badge>}
            {talk.languages.map((language) => (
              <Badge key={language} color="indigo">
                {getLanguage(language)}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-col justify-between gap-4 sm:mt-0 sm:flex-shrink-0 sm:flex-row">
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

      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <div className="rounded-lg border border-gray-200 p-4 sm:w-2/3">
          <H3>Abstract</H3>
          <Markdown source={talk.abstract} className="mt-2" />
          {talk.references && (
            <>
              <H3 className="mt-8">References</H3>
              <Markdown source={talk.references} className="mt-2" />
            </>
          )}
        </div>
        <div className="sm:w-1/3">
          <div className="rounded-lg border border-gray-200 p-4">
            <H3>Speakers</H3>
            <CoSpeakersList speakers={talk.speakers} showRemoveAction={!talk.archived} />
            {!talk.archived && <InviteCoSpeakerButton to="TALK" id={talk.id} invitationLink={talk.invitationLink} />}
          </div>
          <div className="mt-4 rounded-lg border border-gray-200 p-4">
            <H3>Submissions</H3>
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
