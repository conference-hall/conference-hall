import invariant from 'tiny-invariant';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { Container } from '~/design-system/Container';
import { TalkSaveSchema } from '~/schemas/talks';
import { getTalk } from '~/services/speaker-talks/get-talk.server';
import { updateTalk } from '~/services/speaker-talks/save-talk.server';
import { createToast } from '~/utils/toasts';
import { TalkAbstractForm } from '../../components/TalkAbstractForm';
import { Button, ButtonLink } from '../../design-system/Buttons';
import { H2 } from '../../design-system/Typography';
import { sessionRequired } from '../../libs/auth/auth.server';
import { mapErrorToResponse } from '../../libs/errors';

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  invariant(params.talk, 'Invalid talk id');

  try {
    const talk = await getTalk(uid, params.talk);
    if (talk.archived) throw new Response('Talk archived.', { status: 403 });
    return json(talk);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export const action = async ({ request, params }: ActionArgs) => {
  const { uid, session } = await sessionRequired(request);
  const form = await request.formData();
  invariant(params.talk, 'Invalid talk id');

  try {
    const result = await withZod(TalkSaveSchema).validate(form);
    if (result.error) {
      return json(result.error.fieldErrors);
    } else {
      await updateTalk(uid, params.talk, result.data);
      const toast = await createToast(session, 'Talk successfully saved.');
      return redirect(`/speaker/talks/${params.talk}`, toast);
    }
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export default function SpeakerTalkRoute() {
  const talk = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();

  return (
    <Container className="my-4 sm:my-8">
      <div className="flex flex-wrap items-center justify-between sm:flex-nowrap">
        <div>
          <H2>{talk.title}</H2>
          <span className="test-gray-500 truncate text-sm">by {talk.speakers.map((s) => s.name).join(', ')}</span>
        </div>
      </div>

      <Form method="post" className="sm:mt-4 sm:rounded-lg sm:border sm:border-gray-200">
        <div className="py-8 sm:px-6">
          <TalkAbstractForm initialValues={talk} errors={errors} />
        </div>

        <div className="flex flex-col gap-4 py-3 sm:flex-row sm:justify-end sm:bg-gray-50 sm:px-6">
          <ButtonLink to={`/speaker/talks/${talk.id}`} variant="secondary">
            Cancel
          </ButtonLink>
          <Button type="submit">Save abstract</Button>
        </div>
      </Form>
    </Container>
  );
}
