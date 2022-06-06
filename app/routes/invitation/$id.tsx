import { StarIcon } from '@heroicons/react/solid';
import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { Button } from '../../components-ui/Buttons';
import { Container } from '../../components-ui/Container';
import { Link } from '../../components-ui/Links';
import { H1, H2, Text } from '../../components-ui/Typography';
import { requireUserSession } from '../../services/auth/auth.server';
import { mapErrorToResponse } from '../../services/errors';
import { inviteCoSpeakerToProposal } from '../../services/events/proposals.server';
import { getInvitation, Invitation } from '../../services/invitations/invitations.server';
import { inviteCoSpeakerToTalk } from '../../services/speakers/talks.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireUserSession(request);
  const invitationId = params.id;
  if (!invitationId) return null;
  try {
    const invitation = await getInvitation(invitationId);
    return json<Invitation>(invitation);
  } catch (err) {
    mapErrorToResponse(err);
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const invitationId = params.id!;
  const form = await request.formData();
  const type = form.get('_type') as Invitation['type'];

  try {
    if (type === 'TALK') {
      const talk = await inviteCoSpeakerToTalk(invitationId, uid);
      return redirect(`/speaker/talks/${talk.id}`);
    } else {
      const proposal = await inviteCoSpeakerToProposal(invitationId, uid);
      return redirect(`/${proposal.eventSlug}/proposals/${proposal.proposalId}`);
    }
  } catch (err) {
    mapErrorToResponse(err);
  }
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
          <input type="hidden" name="_type" value={invitation.type} />
          <Button type="submit">Accept invitation</Button>
        </Form>
        <Link to="/" className="text-xs mt-2">
          Go to homepage
        </Link>
      </div>
    </Container>
  );
}
