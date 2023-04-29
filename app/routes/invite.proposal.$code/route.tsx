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
import { addCoSpeakerToProposal, checkProposalInviteCode } from './server/invite-proposal.server';

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireSession(request);
  invariant(params.code, 'Invalid code');

  const proposal = await checkProposalInviteCode(params.code);
  if (!proposal) throw new Response('Not found', { status: 404 });

  return json(proposal);
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireSession(request);
  invariant(params.code, 'Invalid code');

  const proposal = await addCoSpeakerToProposal(params.code, userId);
  if (!proposal) throw new Response('Not found', { status: 404 });

  return redirect(`/${proposal.eventSlug}/proposals/${proposal.id}`);
};

export default function InvitationRoute() {
  const proposal = useLoaderData<typeof loader>();
  const { user } = useUser();

  return (
    <>
      <Navbar user={user} />

      <Container className="m-24">
        <div className="flex flex-col items-center bg-white px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
            <StarIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
          </div>
          <H1>You have been invited to proposal</H1>
          <Text size="l">"{proposal.title}"</Text>

          <Form method="POST" className="mt-8 flex w-full flex-col justify-center sm:w-auto">
            <Button type="submit">Accept invitation</Button>
          </Form>
        </div>
      </Container>
    </>
  );
}
