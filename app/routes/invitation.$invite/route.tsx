import invariant from 'tiny-invariant';
import { StarIcon } from '@heroicons/react/20/solid';
import type { ActionFunction, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useLoaderData, useOutletContext } from '@remix-run/react';
import { Navbar } from '~/shared-components/navbar/Navbar';
import { getInvitation } from '~/routes/invitation.$invite/server/get-invitation.server';
import { Button } from '../../design-system/Buttons';
import { Container } from '../../design-system/Container';
import { H1, H2, Text } from '../../design-system/Typography';
import { sessionRequired } from '../../libs/auth/auth.server';
import { mapErrorToResponse } from '../../libs/errors';
import type { UserContext } from '~/root';
import { addMember } from './server/add-member.server';
import { addCoSpeakerToProposal } from './server/add-co-speaker-to-proposal.server';
import { addCoSpeakerToTalk } from './server/add-co-speaker-to-talk.server';

export const loader = async ({ request, params }: LoaderArgs) => {
  await sessionRequired(request);
  invariant(params.invite, 'Invalid invite');

  try {
    const invitation = await getInvitation(params.invite);
    return json(invitation);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const { uid } = await sessionRequired(request);
  invariant(params.invite, 'Invalid invite');
  const form = await request.formData();
  const type = form.get('_type');

  try {
    if (type === 'TALK') {
      const talk = await addCoSpeakerToTalk(params.invite, uid);
      return redirect(`/speaker/talks/${talk.id}`);
    } else if (type === 'PROPOSAL') {
      const proposal = await addCoSpeakerToProposal(params.invite, uid);
      return redirect(`/${proposal.eventSlug}/proposals/${proposal.proposalId}`);
    } else if (type === 'ORGANIZATION') {
      const organization = await addMember(params.invite, uid);
      return redirect(`/organizer/${organization.slug}`);
    }
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export default function InvitationRoute() {
  const invitation = useLoaderData<typeof loader>();
  const { user, notifications } = useOutletContext<UserContext>();

  return (
    <>
      <Navbar user={user} notifications={notifications} />
      <Container className="m-24">
        <div className="flex flex-col items-center bg-white px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
            <StarIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
          </div>
          <H2 as="h1" className="mt-8 text-center">
            You have been invited to
          </H2>
          <H1 as="p" className="mt-6">
            "{invitation.title}"
          </H1>
          <Text className="mt-2">Invitation sent by {invitation.invitedBy}</Text>

          <Form method="post" className="mt-8 flex w-full flex-col justify-center sm:w-auto">
            <input type="hidden" name="_type" value={invitation.type} />
            <Button type="submit">Accept invitation</Button>
          </Form>
        </div>
      </Container>
    </>
  );
}
