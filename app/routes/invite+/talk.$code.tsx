import type { ActionFunction, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { CoSpeakerTalkInvite } from '~/.server/speaker-talks-library/CoSpeakerTalkInvite';
import { Button } from '~/design-system/Buttons.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { Page } from '~/design-system/layouts/PageContent.tsx';
import { H1, Text } from '~/design-system/Typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { Navbar } from '~/routes/__components/navbar/Navbar.tsx';
import { useUser } from '~/routes/__components/useUser';

export const meta = mergeMeta(() => [{ title: 'Talk invitation | Conference Hall' }]);

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireSession(request);
  invariant(params.code, 'Invalid code');

  const talk = await CoSpeakerTalkInvite.with(params.code).check();
  return json({ id: talk.id, title: talk.title });
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireSession(request);
  invariant(params.code, 'Invalid code');

  const talk = await CoSpeakerTalkInvite.with(params.code).addCoSpeaker(userId);
  return redirect(`/speaker/talks/${talk.id}`);
};

export default function InvitationRoute() {
  const talk = useLoaderData<typeof loader>();
  const { user } = useUser();

  return (
    <>
      <Navbar user={user} />

      <Page>
        <Card p={16} className="flex flex-col items-center">
          <H1 mb={4} variant="secondary">
            You have been invited to the talk
          </H1>

          <Text size="3xl" weight="medium" mb={8}>
            {talk.title}
          </Text>

          <Form method="POST">
            <Button type="submit">Accept invitation</Button>
          </Form>
        </Card>
      </Page>
    </>
  );
}
