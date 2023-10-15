import { parse } from '@conform-to/zod';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';

import { Button } from '~/design-system/Buttons.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { PageContent } from '~/design-system/layouts/PageContent.tsx';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { redirectWithToast } from '~/libs/toasts/toast.server.ts';
import { DetailsForm } from '~/routes/__components/proposals/forms/DetailsForm.tsx';
import { TalkSaveSchema } from '~/routes/__types/talks.ts';

import { createTalk } from './__server/create-talk.server.ts';

export const meta = mergeMeta(() => [{ title: 'New talk | Conference Hall' }]);

export const action = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  const form = await request.formData();

  const result = parse(form, { schema: TalkSaveSchema });
  if (!result.value) return json(result.error);

  const talkId = await createTalk(userId, result.value);
  return redirectWithToast(`/speaker/talks/${talkId}`, 'success', 'New talk created.');
};

export default function NewTalkRoute() {
  const errors = useActionData<typeof action>();

  return (
    <>
      <PageHeaderTitle title="Create a new talk" backTo="/speaker/talks" />

      <PageContent>
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
      </PageContent>
    </>
  );
}
