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
import { H2 } from '~/design-system/Typography';
import { DetailsForm } from '~/shared-components/proposals/forms/DetailsForm';
import { Button } from '~/design-system/Buttons';
import { Card } from '~/design-system/Card';
import { IconButtonLink } from '~/design-system/IconButtons';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

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
    <Container className="my-4 space-y-8 sm:my-8">
      <div className="flex items-start gap-4">
        <IconButtonLink icon={ArrowLeftIcon} variant="secondary" to="/speaker/talks" aria-label="Go back" />
        <H2 mb={0}>Create a new talk</H2>
      </div>

      <Card p={8} rounded="xl">
        <Form method="POST" className="space-y-8">
          <DetailsForm errors={errors} />
          <Button type="submit">Create new talk</Button>
        </Form>
      </Card>
    </Container>
  );
}
