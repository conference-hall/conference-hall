import type { ActionFunction, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Button } from '~/design-system/Buttons';
import { Card } from '~/design-system/layouts/Card';
import { Container } from '~/design-system/layouts/Container';
import { H1, Text } from '~/design-system/Typography';
import { requireSession } from '~/libs/auth/session';
import { mergeMeta } from '~/libs/meta/merge-meta';
import { useUser } from '~/root';
import { Navbar } from '~/routes/__components/navbar/Navbar';

import { addCoSpeakerToTalk, checkTalkInviteCode } from './__server/invite-talk.server';

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

          <Text size="3xl" heading strong mb={8}>
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
