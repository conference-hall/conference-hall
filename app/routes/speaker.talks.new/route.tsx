import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { Container } from '~/design-system/Container';
import { TalkSaveSchema } from '~/schemas/talks';
import { createTalk } from './server/create-talk.server';
import { sessionRequired } from '~/libs/auth/auth.server';
import { mapErrorToResponse } from '~/libs/errors';
import { DetailsForm } from '~/shared-components/proposals/forms/DetailsForm';
import { Button } from '~/design-system/Buttons';
import { Card } from '~/design-system/Card';
import { Header } from '~/shared-components/Header';

export const action = async ({ request }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  const form = await request.formData();

  const result = await withZod(TalkSaveSchema).validate(form);
  if (result.error) return json(result.error.fieldErrors);
  try {
    const talkId = await createTalk(uid, result.data);
    return redirect(`/speaker/talks/${talkId}`);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export default function NewTalkRoute() {
  const errors = useActionData<typeof action>();

  return (
    <>
      <Header title="Create a new talk" backTo="/speaker/talks" />

      <Container className="mt-4 space-y-8 sm:mt-8">
        <Card p={8} rounded="xl">
          <Form method="POST" className="space-y-8">
            <DetailsForm errors={errors} />
            <Button type="submit">Create new talk</Button>
          </Form>
        </Card>
      </Container>
    </>
  );
}
