import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node';
import { Form, useActionData, useCatch, useLoaderData } from '@remix-run/react';
import { Container } from '~/components/layout/Container';
import { Button, ButtonLink } from '../../../components/Buttons';
import { TalkAbstractForm } from '../../../components/proposal/TalkAbstractForm';
import { H1, H2 } from '../../../components/Typography';
import { requireUserSession } from '../../../features/auth/auth.server';
import {
  deleteSpeakerTalk,
  getSpeakerTalk,
  SpeakerTalk,
  updateSpeakerTalk,
  validateTalkForm,
} from '../../../features/speaker-talks.server';
import { ValidationErrors } from '../../../utils/validation-errors';

export const loader: LoaderFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  try {
    const talk = await getSpeakerTalk(uid, params.id);
    return json<SpeakerTalk>(talk);
  } catch {
    throw new Response('Talk not found.', { status: 404 });
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const form = await request.formData();
  const method = form.get('_method');

  try {
    if (method === 'DELETE') {
      await deleteSpeakerTalk(uid, params.id);
      return redirect('/speaker/talks');
    } else {
      const result = validateTalkForm(form);
      if (!result.success) {
        return result.error.flatten();
      } else {
        await updateSpeakerTalk(uid, params.id, result.data);
        return redirect(`/speaker/talks/${params.id}`);
      }
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
          <Form method="post">
            <input type="hidden" name="_method" value="DELETE" />
            <Button type="submit">Delete abstract</Button>
          </Form>
        </div>
      </div>

      <Form method="post" className="mt-4 bg-white border border-gray-200 overflow-hidden sm:rounded-lg">
        <div className="px-4 py-8 sm:px-6">
          <TalkAbstractForm initialValues={talk} errors={errors?.fieldErrors} />
        </div>

        <div className="px-4 py-3 bg-gray-50 text-right space-x-4 sm:px-6">
          <Button type="submit" className="ml-4">
            Save abstract
          </Button>
        </div>
      </Form>
    </Container>
  );
}

