import { ActionFunction, redirect } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { Container } from '~/components-ui/Container';
import { TalkAbstractForm } from '../../../components-app/TalkAbstractForm';
import { Button } from '../../../components-ui/Buttons';
import { H1 } from '../../../components-ui/Typography';
import { requireUserSession } from '../../../services/auth/auth.server';
import { mapErrorToResponse } from '../../../services/errors';
import {
  createTalk,
  validateTalkForm,
} from '../../../services/speakers/talks.server';
import { ValidationErrors } from '../../../utils/validation-errors';

export const action: ActionFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const form = await request.formData();

  const result = validateTalkForm(form);
  if (!result.success) {
    return result.error.flatten();
  }
  try {
    const talkId = await createTalk(uid, result.data);
    return redirect(`/speaker/talks/${talkId}`);
  } catch (err) {
    mapErrorToResponse(err);
  }
};

export default function NewSpeakerTalkRoute() {
  const errors = useActionData<ValidationErrors>();

  return (
    <Container className="py-8">
      <H1>New talk abstract</H1>

      <Form
        method="post"
        className="mt-4 overflow-hidden border border-gray-200 bg-white sm:rounded-lg"
      >
        <div className="px-4 py-8 sm:px-6">
          <TalkAbstractForm errors={errors?.fieldErrors} />
        </div>

        <div className="space-x-4 bg-gray-50 px-4 py-3 text-right sm:px-6">
          <Button type="submit" className="ml-4">
            Create abstract
          </Button>
        </div>
      </Form>
    </Container>
  );
}
