import type { ActionFunction, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Navbar } from '~/components/navbar/Navbar';
import { Button } from '~/design-system/Buttons';
import { Card } from '~/design-system/layouts/Card';
import { Container } from '~/design-system/layouts/Container';
import { H1, H2 } from '~/design-system/Typography';
import { requireSession } from '~/libs/auth/session';
import { useUser } from '~/root';

import { addCoSpeakerToTalk, checkTalkInviteCode } from './server/invite-talk.server';

export const loader = async ({ request, params }: LoaderArgs) => {
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
          <H1 size="l" mb={4} variant="secondary">
            You have been invited to the talk
          </H1>

          <H2 size="3xl" mb={8}>
            {talk.title}
          </H2>

          <Form method="POST">
            <Button type="submit">Accept invitation</Button>
          </Form>
        </Card>
      </Container>
    </>
  );
}
