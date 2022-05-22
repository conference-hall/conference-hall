import { StarIcon } from '@heroicons/react/solid';
import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { Button } from '../../components/Buttons';
import { Container } from '../../components/layout/Container';
import { Link } from '../../components/Links';
import { H1, H2, Text } from '../../components/Typography';
import { requireUserSession } from '../../features/auth/auth.server';
import { db } from '../../services/db';

type Invitation = {
  type: 'SPEAKER' | 'ORGANIZATION';
  title: string;
  invitedBy: string;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireUserSession(request);
  const invitation = await db.invite.findUnique({
    select: { type: true, talk: true, organization: true, invitedBy: true },
    where: { id: params.id },
  });
  if (!invitation) {
    throw new Response('Invitation not found.', { status: 404 });
  }
  return json<Invitation>({
    type: invitation.type,
    title: invitation.talk?.title || '',
    invitedBy: invitation.invitedBy.name || '',
  });
};

export const action: ActionFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);

  const invitation = await db.invite.findUnique({
    select: { type: true, talk: true, organization: true, invitedBy: true },
    where: { id: params.id },
  });
  if (!invitation) {
    throw new Response('Invitation not found.', { status: 404 });
  }

  if (invitation.type === 'SPEAKER' && invitation.talk) {
    const talk = await db.talk.update({
      data: { speakers: { connect: { id: uid } } },
      where: { id: invitation.talk.id },
    });
    return redirect(`/speaker/talks/${talk.id}`);
  }

  return null;
};

export default function InvitationRoute() {
  const invitation = useLoaderData<Invitation>();
  return (
    <Container className="m-24">
      <div className="bg-white shadow sm:rounded-lg px-4 py-5 sm:p-6 flex flex-col items-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
          <StarIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
        </div>
        <Text className="mt-4">Invitation sent by {invitation.invitedBy}</Text>
        <H2 as="h1" className="mt-2">
          You have been invited as co-speaker for
        </H2>
        <H1 as="p" className="mt-6">
          "{invitation.title}"
        </H1>

        <Form method="post" className="mt-8">
          <Button type="submit">Accept invitation</Button>
        </Form>
        <Link to="/" className="text-xs mt-2">
          Go to homepage
        </Link>
      </div>
    </Container>
  );
}
