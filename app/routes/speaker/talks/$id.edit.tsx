import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { Container } from '~/design-system/Container';
import { TalkAbstractForm } from '../../../components/TalkAbstractForm';
import { Button, ButtonLink } from '../../../design-system/Buttons';
import { H2 } from '../../../design-system/Typography';
import { sessionRequired } from '../../../services/auth/auth.server';
import { mapErrorToResponse } from '../../../services/errors';
import type { SpeakerTalk } from '../../../services/speakers/talks.server';
import { getTalk, updateTalk, validateTalkForm } from '../../../services/speakers/talks.server';
import type { ValidationErrors } from '../../../utils/validation-errors';

export const loader: LoaderFunction = async ({ request, params }) => {
  const uid = await sessionRequired(request);
  try {
    const talk = await getTalk(uid, params.id!);
    if (talk.archived) {
      throw new Response('Talk archived.', { status: 403 });
    }
    return json<SpeakerTalk>(talk);
  } catch (err) {
    mapErrorToResponse(err);
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const uid = await sessionRequired(request);
  const form = await request.formData();
  try {
    const result = validateTalkForm(form);
    if (!result.success) {
      return result.error.flatten();
    } else {
      await updateTalk(uid, params.id, result.data);
      return redirect(`/speaker/talks/${params.id}`);
    }
  } catch (err) {
    mapErrorToResponse(err);
  }
};

export default function SpeakerTalkRoute() {
  const talk = useLoaderData<SpeakerTalk>();
  const errors = useActionData<ValidationErrors>();

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
          <TalkAbstractForm initialValues={talk} errors={errors?.fieldErrors} />
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
