import type { ActionFunction, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Button } from '~/design-system/Buttons.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { Container } from '~/design-system/layouts/Container.tsx';
import { H1, Text } from '~/design-system/Typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { useUser } from '~/root.tsx';
import { Navbar } from '~/routes/__components/navbar/Navbar.tsx';

import { addCoSpeakerToTalk, checkTalkInviteCode } from './__server/invite-talk.server.ts';

export const meta = mergeMeta(() => [{ title: 'Talk invitation | Conference Hall' }]);

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireSession(request);
  invariant(params.code, 'Invalid code');

  const talk = await checkTalkInviteCode(params.code);
  if (!talk) throw new Response('Not found', { status: 404 });

  return json(talk);
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireSession(request);
  invariant(params.code, 'Invalid code');

  const talk = await addCoSpeakerToTalk(params.code, userId);
  if (!talk) throw new Response('Not found', { status: 404 });

  return redirect(`/speaker/talks/${talk.id}`);
};

export default function InvitationRoute() {
  const talk = useLoaderData<typeof loader>();
  const { user } = useUser();

  return (
    <>
      <Navbar user={user} />

      <Container className="m-8">
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
      </Container>
    </>
  );
}
