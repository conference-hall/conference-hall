import type { ActionFunction, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { Button, ButtonLink } from '~/design-system/Buttons';
import { InviteCoSpeakerButton, CoSpeakersList } from '../../../../components/CoSpeaker';
import { useSubmissionStep } from '../../../../components/useSubmissionStep';
import { MarkdownTextArea } from '../../../../design-system/forms/MarkdownTextArea';
import { ExternalLink } from '../../../../design-system/Links';
import { H2, Text } from '../../../../design-system/Typography';
import { sessionRequired } from '../../../../services/auth/auth.server';
import { mapErrorToResponse } from '../../../../services/errors';
import { getEvent } from '../../../../services/events/event.server';
import { removeCoSpeakerFromTalkAndEvent } from '../../../../services/events/proposals.server';
import { getProposalSpeakers } from '../../../../services/events/speakers.server';
import { updateSettings } from '../../../../services/speakers/profile.server';
import { getUser } from '../../../../services/auth/user.server';
import { DetailsSchema } from '~/schemas/profile';
import { withZod } from '@remix-validated-form/with-zod';

export const handle = { step: 'speakers' };

export const loader = async ({ request, params }: LoaderArgs) => {
  const uid = await sessionRequired(request);
  const user = await getUser(uid);
  const eventSlug = params.eventSlug!;
  const talkId = params.talkId!;
  try {
    const proposal = await getProposalSpeakers(talkId, eventSlug, user.id);
    return json({
      proposalId: proposal.id,
      invitationLink: proposal.invitationLink,
      currentSpeaker: { bio: user.bio, references: user.references },
      speakers: proposal.speakers.filter((speaker) => speaker.id !== user.id),
    });
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const uid = await sessionRequired(request);
  const talkId = params.talkId!;
  const eventSlug = params.eventSlug!;
  const form = await request.formData();

  try {
    const action = form.get('_action');
    if (action === 'remove-speaker') {
      const speakerId = form.get('_speakerId')?.toString() as string;
      await removeCoSpeakerFromTalkAndEvent(uid, talkId, eventSlug, speakerId);
      return null;
    } else {
      const result = await withZod(DetailsSchema).validate(form);
      if (result.error) return json(result.error.fieldErrors);
      await updateSettings(uid, result.data);
      const event = await getEvent(eventSlug);
      if (event.hasTracks) {
        return redirect(`/${eventSlug}/submission/${talkId}/tracks`);
      } else if (event.hasSurvey) {
        return redirect(`/${eventSlug}/submission/${talkId}/survey`);
      } else {
        return redirect(`/${eventSlug}/submission/${talkId}/submit`);
      }
    }
  } catch (err) {
    mapErrorToResponse(err);
  }
};

export default function SubmissionSpeakerRoute() {
  const data = useLoaderData<typeof loader>();
  const errors = useActionData();
  const { previousPath } = useSubmissionStep();

  return (
    <>
      <div className="py-6 sm:px-8 sm:py-10">
        <Form id="speaker-form" method="post">
          <div>
            <H2>Speaker details</H2>
            <Text variant="secondary" className="mt-1">
              Give more information about you, these information will be visible by organizers when you submit a talk.
            </Text>
          </div>
          <MarkdownTextArea
            name="bio"
            label="Biography"
            rows={5}
            error={errors?.bio}
            defaultValue={data.currentSpeaker.bio || ''}
            className="mt-6"
          />
          <input type="hidden" name="references" value={data.currentSpeaker.references || ''} />
          <Text className="mt-2">
            You can give more information about you from{' '}
            <ExternalLink href="/speaker/settings">the profile page.</ExternalLink>
          </Text>
        </Form>
        <div className="mt-12">
          <H2>Co-speakers</H2>
          <Text variant="secondary" className="mt-1">
            This information will be displayed publicly so be careful what you share.
          </Text>
          {data.speakers.length > 1 && (
            <CoSpeakersList speakers={data.speakers} showRemoveAction className="max-w-md py-4" />
          )}
          <InviteCoSpeakerButton to="PROPOSAL" id={data.proposalId} invitationLink={data.invitationLink} />
        </div>
      </div>
      <div className="my-4 flex justify-between gap-4 sm:flex-row sm:justify-end sm:px-8 sm:pb-4">
        <ButtonLink to={previousPath} variant="secondary">
          Back
        </ButtonLink>
        <Button form="speaker-form">Next</Button>
      </div>
    </>
  );
}
