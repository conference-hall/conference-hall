import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { Container } from '~/components-ui/Container';
import { TalkAbstractForm } from '../../../components-app/TalkAbstractForm';
import { Button, ButtonLink } from '../../../components-ui/Buttons';
import { H1 } from '../../../components-ui/Typography';
import { requireUserSession } from '../../../services/auth/auth.server';
import { mapErrorToResponse } from '../../../services/errors';
import {
  getTalk,
  SpeakerTalk,
  updateTalk,
  validateTalkForm,
} from '../../../services/speakers/talks.server';
import { ValidationErrors } from '../../../utils/validation-errors';

export const loader: LoaderFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
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
  } catch (err) {
    mapErrorToResponse(err);
  }
};

export default function SpeakerTalkRoute() {
  const talk = useLoaderData<SpeakerTalk>();
  const errors = useActionData<ValidationErrors>();

  return (
    <Container className="py-8">
      <div className="flex flex-wrap items-center justify-between sm:flex-nowrap">
        <div>
          <H1>{talk.title}</H1>
          <span className="test-gray-500 truncate text-sm">
            by {talk.speakers.map((s) => s.name).join(', ')}
          </span>
        </div>
        <div className="flex-shrink-0 space-x-4">
          <ButtonLink
            to={`/speaker/talks/${talk.id}`}
            variant="secondary"
            className="ml-4"
          >
            Cancel
          </ButtonLink>
        </div>
      </div>

      <Form
        method="post"
        className="mt-4 overflow-hidden border border-gray-200 bg-white sm:rounded-lg"
      >
        <div className="px-4 py-8 sm:px-6">
          <TalkAbstractForm initialValues={talk} errors={errors?.fieldErrors} />
        </div>

        <div className="space-x-4 bg-gray-50 px-4 py-3 text-right sm:px-6">
          <ButtonLink
            to={`/speaker/talks/${talk.id}`}
            variant="secondary"
            className="ml-4"
          >
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
