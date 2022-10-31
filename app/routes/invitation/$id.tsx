import { StarIcon } from '@heroicons/react/20/solid';
import type { ActionFunction, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { Navbar } from '~/components/navbar/Navbar';
import { inviteMemberToOrganization } from '~/services/organizers/organizations.server';
import { Button } from '../../design-system/Buttons';
import { Container } from '../../design-system/Container';
import { Link } from '../../design-system/Links';
import { H1, H2, Text } from '../../design-system/Typography';
import { sessionRequired } from '../../services/auth/auth.server';
import { mapErrorToResponse } from '../../services/errors';
import { inviteCoSpeakerToProposal } from '../../services/events/proposals.server';
import { getInvitation } from '../../services/invitations/invitations.server';
import { inviteCoSpeakerToTalk } from '../../services/speakers/talks.server';

export const loader = async ({ request, params }: LoaderArgs) => {
  await sessionRequired(request);
  const invitationId = params.id;
  if (!invitationId) {
    throw new Response('Invite not found', { status: 404 });
  }
  try {
    const invitation = await getInvitation(invitationId);
    return json(invitation);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const { uid } = await sessionRequired(request);
  const invitationId = params.id!;
  const form = await request.formData();
  const type = form.get('_type');
  try {
    if (type === 'TALK') {
      const talk = await inviteCoSpeakerToTalk(invitationId, uid);
      return redirect(`/speaker/talks/${talk.id}`);
    } else if (type === 'PROPOSAL') {
      const proposal = await inviteCoSpeakerToProposal(invitationId, uid);
      return redirect(`/${proposal.eventSlug}/proposals/${proposal.proposalId}`);
    } else if (type === 'ORGANIZATION') {
      const organization = await inviteMemberToOrganization(invitationId, uid);
      return redirect(`/organizer/${organization.slug}`);
    }
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export default function InvitationRoute() {
  const invitation = useLoaderData<typeof loader>();

  return (
    <>
      <Navbar />
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
          <Link to="/" className="mt-2 text-xs">
            Go to homepage
          </Link>
        </div>
      </Container>
    </>
  );
}
