import invariant from 'tiny-invariant';
import { StarIcon } from '@heroicons/react/20/solid';
import type { ActionFunction, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { Navbar } from '~/shared-components/navbar/Navbar';
import { requireSession } from '~/libs/auth/session';
import { Container } from '~/design-system/layouts/Container';
import { H1, Text } from '~/design-system/Typography';
import { Button } from '~/design-system/Buttons';
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

      <Container className="m-24">
        <div className="flex flex-col items-center bg-white px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
            <StarIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
          </div>
          <H1>You have been invited to talk</H1>
          <Text size="l">"{talk.title}"</Text>

          <Form method="POST" className="mt-8 flex w-full flex-col justify-center sm:w-auto">
            <Button type="submit">Accept invitation</Button>
          </Form>
        </div>
      </Container>
    </>
  );
}
