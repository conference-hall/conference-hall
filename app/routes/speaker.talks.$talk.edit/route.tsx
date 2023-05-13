import invariant from 'tiny-invariant';
import type { ActionArgs, ActionFunction, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData, useNavigate } from '@remix-run/react';
import { TalkSaveSchema } from '~/schemas/talks';
import { getTalk } from '~/shared-server/talks/get-talk.server';
import { updateTalk } from '~/routes/speaker.talks.$talk.edit/server/update-talk.server';
import { addToast } from '~/libs/toasts/toasts';
import { DetailsForm } from '~/shared-components/proposals/forms/DetailsForm';
import { Button, ButtonLink } from '~/design-system/Buttons';
import { H3, Subtitle } from '~/design-system/Typography';
import { requireSession } from '~/libs/auth/session';
import { CoSpeakersList, InviteCoSpeakerButton } from '~/shared-components/proposals/forms/CoSpeaker';
import { removeCoSpeakerFromTalk } from '~/shared-server/talks/remove-co-speaker.server';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle';
import { Container } from '~/design-system/layouts/Container';
import { Card } from '~/design-system/layouts/Card';
import { parse } from '@conform-to/zod';

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireSession(request);
  invariant(params.talk, 'Invalid talk id');

  const talk = await getTalk(userId, params.talk);
  if (talk.archived) throw new Response('Talk archived.', { status: 403 });
  return json(talk);
};

export const action: ActionFunction = async ({ request, params }: ActionArgs) => {
  const userId = await requireSession(request);
  const form = await request.formData();
  invariant(params.talk, 'Invalid talk id');

  const intent = form.get('intent');
  if (intent === 'remove-speaker') {
    const speakerId = form.get('_speakerId')?.toString() as string;
    await removeCoSpeakerFromTalk(userId, params.talk, speakerId);
    return json(null, await addToast(request, 'Co-speaker removed from talk.'));
  } else {
    const result = parse(form, { schema: TalkSaveSchema });
    if (!result.value) return json(result.error);
    await updateTalk(userId, params.talk, result.value);
    return redirect(`/speaker/talks/${params.talk}`, await addToast(request, 'Talk updated.'));
  }
};

export default function SpeakerTalkRoute() {
  const talk = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();
  const navigate = useNavigate();

  return (
    <>
      <PageHeaderTitle title={talk.title} backOnClick={() => navigate(-1)} />

      <Container className="mt-4 space-y-8 sm:mt-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-flow-col-dense lg:grid-cols-3">
          <Card className="lg:col-span-2 lg:col-start-1">
            <Card.Content>
              <Form method="POST" id="edit-talk-form">
                <DetailsForm initialValues={talk} errors={errors} />
              </Form>
            </Card.Content>
            <Card.Actions>
              <ButtonLink to={`/speaker/talks/${talk.id}`} variant="secondary">
                Cancel
              </ButtonLink>
              <Button type="submit" name="intent" value="talk-edit" form="edit-talk-form">
                Save talk
              </Button>
            </Card.Actions>
          </Card>

          <div className="lg:col-span-1 lg:col-start-3">
            <Card p={8} className="space-y-6">
              <div>
                <H3>Speakers</H3>
                <Subtitle>When co-speaker accepts the invite, he/she will be automatically added to the talk.</Subtitle>
              </div>
              <CoSpeakersList speakers={talk.speakers} showRemoveAction />
              <InviteCoSpeakerButton invitationLink={talk.invitationLink} block />
            </Card>
          </div>
        </div>
      </Container>
    </>
  );
}
