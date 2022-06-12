import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { Button, ButtonLink } from '~/components-ui/Buttons';
import { InviteCoSpeakerButton, CoSpeakersList } from '../../../../components-app/CoSpeaker';
import { useSubmissionStep } from '../../../../components-app/useSubmissionStep';
import { MarkdownTextArea } from '../../../../components-ui/forms/MarkdownTextArea';
import { ExternalLink } from '../../../../components-ui/Links';
import { H2, Text } from '../../../../components-ui/Typography';
import { requireAuthUser, requireUserSession } from '../../../../services/auth/auth.server';
import { mapErrorToResponse } from '../../../../services/errors';
import { getEvent } from '../../../../services/events/event.server';
import { removeCoSpeakerFromProposal } from '../../../../services/events/proposals.server';
import { getProposalSpeakers } from '../../../../services/events/speakers.server';
import { updateProfile, validateProfileData } from '../../../../services/speakers/settings.server';
import { ValidationErrors } from '../../../../utils/validation-errors';

type SubmissionSpeakers = {
  proposalId: string;
  invitationLink?: string;
  currentSpeaker: {
    bio: string | null;
  }
  speakers: Array<{
    id: string;
    name: string | null;
    photoURL: string | null;
    isOwner: boolean;
  }>;
}

export const handle = { step: 'speakers' };

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireAuthUser(request);
  const eventSlug = params.eventSlug!;
  const talkId = params.talkId!;
  try {
    const proposal = await getProposalSpeakers(talkId, eventSlug, user.id);
    return json<SubmissionSpeakers>({
      proposalId: proposal.id,
      invitationLink: proposal.invitationLink,
      currentSpeaker: { bio: user.bio },
      speakers: proposal.speakers.filter(speaker => speaker.id !== user.id),
    });
  } catch (err) {
    mapErrorToResponse(err);
  }
  return null;
};

export const action: ActionFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const talkId = params.talkId!;
  const eventSlug = params.eventSlug!;
  const form = await request.formData();
  const result = validateProfileData(form, 'DETAILS');

  if (!result.success) {
    return result.error.flatten();
  }
  try {
    const action = form.get('_action');
    if (action === 'remove-speaker') {
      const speakerId = form.get('_speakerId')?.toString() as string;
      await removeCoSpeakerFromProposal(uid, talkId, eventSlug, speakerId);
      return null;
    } else {
      await updateProfile(uid, result.data);
      const event = await getEvent(eventSlug)
      if (event.hasTracks) {
        return redirect(`/${eventSlug}/submission/${talkId}/tracks`);
      } else if (event.hasSurvey) {
        return redirect(`/${eventSlug}/submission/${talkId}/survey`);
      } else {
        return redirect(`/${eventSlug}/submission/${talkId}/submit`);
      }
    }
  } catch(err) {
    mapErrorToResponse(err);
  }
};

export default function SubmissionSpeakerRoute() {
  const data = useLoaderData<SubmissionSpeakers>();
  const errors = useActionData<ValidationErrors>();
  const { previousPath } = useSubmissionStep();
  const fieldErrors = errors?.fieldErrors;

  return (
    <>
      <div className="px-8 py-6 sm:py-10">
        <Form id="speaker-form" method="post">
          <div>
            <H2>Speaker details</H2>
            <Text variant="secondary" className="mt-1">
              Give more information about you, these information will be visible by organizers when you submit a talk.
            </Text>
          </div>
          <MarkdownTextArea
            id="bio"
            name="bio"
            label="Biography"
            rows={5}
            error={fieldErrors?.bio?.[0]}
            defaultValue={data.currentSpeaker.bio || ''}
            className="mt-6"
          />
          <Text className="mt-2">
            You can give more information about you from <ExternalLink href="/speaker/settings">the settings page.</ExternalLink>
          </Text>
        </Form>
        <div className="mt-12">
          <H2>Co-speakers</H2>
          <Text variant="secondary" className="mt-1">
            This information will be displayed publicly so be careful what you share.
          </Text>
          <CoSpeakersList speakers={data.speakers} showRemoveAction className="py-4 max-w-md" />
          <InviteCoSpeakerButton to='PROPOSAL' id={data.proposalId} invitationLink={data.invitationLink} />
        </div>
      </div>
      <div className="px-4 py-5 text-right sm:px-6">
        <ButtonLink to={previousPath} variant="secondary">
          Back
        </ButtonLink>
        <Button form="speaker-form" className="ml-4">
          Next
        </Button>
      </div>
    </>
  );
}
