import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { TalkSaveSchema } from '~/schemas/talks';
import { createTalk } from './server/create-talk.server';
import { requireSession } from '~/libs/auth/session';
import { DetailsForm } from '~/shared-components/proposals/forms/DetailsForm';
import { Button } from '~/design-system/Buttons';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle';
import { Container } from '~/design-system/layouts/Container';
import { Card } from '~/design-system/layouts/Card';
import { addToast } from '~/libs/toasts/toasts';

export const action = async ({ request }: LoaderArgs) => {
  const userId = await requireSession(request);
  const form = await request.formData();

  const result = await withZod(TalkSaveSchema).validate(form);
  if (result.error) return json(result.error.fieldErrors);

  const talkId = await createTalk(userId, result.data);
  return redirect(`/speaker/talks/${talkId}`, await addToast(request, 'New talk created.'));
};

export default function NewTalkRoute() {
  const errors = useActionData<typeof action>();

  return (
    <>
      <PageHeaderTitle title="Create a new talk" backTo="/speaker/talks" />

      <Container className="mt-4 space-y-8 sm:mt-8">
        <Card>
          <Card.Content>
            <Form method="POST" id="new-talk-form" className="space-y-8">
              <DetailsForm errors={errors} />
            </Form>
          </Card.Content>

          <Card.Actions>
            <Button type="submit" form="new-talk-form">
              Create new talk
            </Button>
          </Card.Actions>
        </Card>
      </Container>
    </>
  );
}
