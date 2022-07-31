import { StarIcon } from '@heroicons/react/solid';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { Button } from '../../design-system/Buttons';
import { Container } from '../../design-system/Container';
import { Link } from '../../design-system/Links';
import { H1, H2, Text } from '../../design-system/Typography';
import { requireUserSession } from '../../services/auth/auth.server';
import { mapErrorToResponse } from '../../services/errors';
import { inviteCoSpeakerToProposal } from '../../services/events/proposals.server';
import type { Invitation } from '../../services/invitations/invitations.server';
import { getInvitation } from '../../services/invitations/invitations.server';
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
      <div className="flex flex-col items-center bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
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
        <Link to="/" className="mt-2 text-xs">
          Go to homepage
        </Link>
      </div>
    </Container>
  );
}
