import invariant from 'tiny-invariant';
import type { ActionFunction, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { Container } from '../../design-system/Container';
import Badge from '../../design-system/Badges';
import { Button, ButtonLink } from '../../design-system/Buttons';
import { Markdown } from '../../design-system/Markdown';
import { H2, H3 } from '../../design-system/Typography';
import { EventActivity } from '../../components/SpeakerActivities';
import { sessionRequired } from '../../libs/auth/auth.server';
import { getLanguage } from '../../utils/languages';
import { getLevel } from '../../utils/levels';
import { removeCoSpeakerFromTalk } from '../../shared/talks/remove-co-speaker.server';
import { mapErrorToResponse } from '../../libs/errors';
import { TalkActionsMenu } from '../../components/TalkActionsMenu';
import { InviteCoSpeakerButton, CoSpeakersList } from '../../components/CoSpeaker';
import { getTalk } from '~/shared/talks/get-talk.server';
import { archiveTalk, restoreTalk } from './archive-talk.server';
import { deleteTalk } from './delete-talk.server';

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  invariant(params.talk, 'Invalid talk id');

  try {
    const talk = await getTalk(uid, params.talk);
    return json(talk);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const { uid } = await sessionRequired(request);
  invariant(params.talk, 'Invalid talk id');
  const form = await request.formData();
  const action = form.get('_action');

  if (action === 'remove-speaker') {
    const speakerId = form.get('_speakerId')?.toString();
    if (speakerId) await removeCoSpeakerFromTalk(uid, params.talk, speakerId);
  } else if (action === 'archive-talk') {
    await archiveTalk(uid, params.talk);
  } else if (action === 'restore-talk') {
    await restoreTalk(uid, params.talk);
  } else if (action === 'delete-talk') {
    await deleteTalk(uid, params.talk);
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
