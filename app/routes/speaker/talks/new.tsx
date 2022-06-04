import { ActionFunction, redirect } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { Container } from '~/components/layout/Container';
import { Button } from '../../../components/Buttons';
import { TalkAbstractForm } from '../../../components/proposal/TalkAbstractForm';
import { H1 } from '../../../components/Typography';
import { requireUserSession } from '../../../services/auth/auth.server';
import { createTalk, validateTalkForm } from '../../../services/speakers/talks.server';
import { ValidationErrors } from '../../../utils/validation-errors';

export const action: ActionFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const form = await request.formData();

  const result = validateTalkForm(form);
  if (!result.success) {
    return result.error.flatten();
  } else {
    const talkId = await createTalk(uid, result.data);
    return redirect(`/speaker/talks/${talkId}`);
  }
};

export default function NewSpeakerTalkRoute() {
  const errors = useActionData<ValidationErrors>();

  return (
    <Container className="py-8">
      <H1>New talk abstract</H1>

      <Form method="post" className="mt-4 bg-white border border-gray-200 overflow-hidden sm:rounded-lg">
        <div className="px-4 py-8 sm:px-6">
          <TalkAbstractForm errors={errors?.fieldErrors} />
        </div>

        <div className="px-4 py-3 bg-gray-50 text-right space-x-4 sm:px-6">
          <Button type="submit" className="ml-4">
            Create abstract
          </Button>
        </div>
      </Form>
    </Container>
  );
}
