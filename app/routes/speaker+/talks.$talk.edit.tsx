import { parse } from '@conform-to/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useActionData, useLoaderData, useNavigate } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { TalksLibrary } from '~/.server/speaker-talks-library/TalksLibrary';
import { TalkSaveSchema } from '~/.server/speaker-talks-library/TalksLibrary.types';
import { Button, ButtonLink } from '~/design-system/Buttons.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { PageContent } from '~/design-system/layouts/PageContent.tsx';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle.tsx';
import { H3, Subtitle } from '~/design-system/Typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { redirectWithToast, toast } from '~/libs/toasts/toast.server.ts';
import { CoSpeakersList, InviteCoSpeakerButton } from '~/routes/__components/proposals/forms/CoSpeaker.tsx';
import { DetailsForm } from '~/routes/__components/proposals/forms/DetailsForm.tsx';

export const meta = mergeMeta<typeof loader>(({ data }) =>
  data ? [{ title: `Edit | ${data?.title} | Conference Hall` }] : [],
);

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.talk, 'Invalid talk id');

  const library = TalksLibrary.of(userId);
  const talk = await library.talk(params.talk).get();
  if (talk.archived) throw new Response('Talk archived.', { status: 403 });
  return json(talk);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  const form = await request.formData();
  invariant(params.talk, 'Invalid talk id');

  const talk = TalksLibrary.of(userId).talk(params.talk);
  const intent = form.get('intent');
  if (intent === 'remove-speaker') {
    const speakerId = form.get('_speakerId')?.toString() as string;
    await talk.removeCoSpeaker(speakerId);
    return toast('success', 'Co-speaker removed from talk.');
  } else {
    const result = parse(form, { schema: TalkSaveSchema });
    if (!result.value) return json(result.error);
    await talk.update(result.value);
    return redirectWithToast(`/speaker/talks/${params.talk}`, 'success', 'Talk updated.');
  }
};

export default function SpeakerTalkRoute() {
  const talk = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();
  const navigate = useNavigate();

  return (
    <>
      <PageHeaderTitle title={talk.title} backOnClick={() => navigate(-1)} />

      <PageContent>
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
      </PageContent>
    </>
  );
}
