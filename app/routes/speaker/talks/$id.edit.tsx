import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { Container } from '~/components/layout/Container';
import { Button, ButtonLink } from '../../../components/Buttons';
import { TalkAbstractForm } from '../../../components/proposal/TalkAbstractForm';
import { H1 } from '../../../components/Typography';
import { requireUserSession } from '../../../features/auth/auth.server';
import {
  getTalk,
  SpeakerTalk,
  updateTalk,
  validateTalkForm,
} from '../../../features/speaker-talks.server';
import { ValidationErrors } from '../../../utils/validation-errors';

export const loader: LoaderFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  try {
    const talk = await getTalk(uid, params.id);
    if (talk.archived) {
      throw new Response('Talk archived.', { status: 403 });
    }
    return json<SpeakerTalk>(talk);
  } catch {
    throw new Response('Talk not found.', { status: 404 });
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const form = await request.formData();
  try {
    const result = validateTalkForm(form);
    if (!result.success) {
      return result.error.flatten();
    } else {
      await updateTalk(uid, params.id, result.data);
      return redirect(`/speaker/talks/${params.id}`);
    }
  } catch {
    throw new Response('Talk not found.', { status: 404 });
  }
};

export default function SpeakerTalkRoute() {
  const talk = useLoaderData<SpeakerTalk>();
  const errors = useActionData<ValidationErrors>();

  return (
    <Container className="py-8">
      <div className="flex justify-between items-center flex-wrap sm:flex-nowrap">
        <div>
          <H1>{talk.title}</H1>
          <span className="text-sm test-gray-500 truncate">by {talk.speakers.map((s) => s.name).join(', ')}</span>
        </div>
        <div className="flex-shrink-0 space-x-4">
          <ButtonLink to={`/speaker/talks/${talk.id}`} variant="secondary" className="ml-4">
            Cancel
          </ButtonLink>
        </div>
      </div>

      <Form method="post" className="mt-4 bg-white border border-gray-200 overflow-hidden sm:rounded-lg">
        <div className="px-4 py-8 sm:px-6">
          <TalkAbstractForm initialValues={talk} errors={errors?.fieldErrors} />
        </div>

        <div className="px-4 py-3 bg-gray-50 text-right space-x-4 sm:px-6">
          <ButtonLink to={`/speaker/talks/${talk.id}`} variant="secondary" className="ml-4">
            Cancel
          </ButtonLink>
          <Button type="submit" className="ml-4">
            Save abstract
          </Button>
        </div>
      </Form>
    </Container>
  );
}
