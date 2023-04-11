import invariant from 'tiny-invariant';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { InviteCoSpeakerButton, CoSpeakersList } from '../../shared-components/proposals/forms/CoSpeaker';
import { MarkdownTextArea } from '../../design-system/forms/MarkdownTextArea';
import { ExternalLink } from '../../design-system/Links';
import { H2, H3, Subtitle, Text } from '../../design-system/Typography';
import { sessionRequired } from '../../libs/auth/auth.server';
import { mapErrorToResponse } from '../../libs/errors';
import { getEvent } from '../../shared-server/events/get-event.server';
import { saveProfile } from '../../shared-server/profile/save-profile.server';
import { getUser } from '../../shared-server/users/get-user.server';
import { withZod } from '@remix-validated-form/with-zod';
import { removeCoSpeakerFromSubmission } from '~/shared-server/proposals/remove-co-speaker.server';
import { getSubmittedProposal } from '../../shared-server/proposals/get-submitted-proposal.server';
import { DetailsSchema } from '~/schemas/profile.schema';
import { Card } from '~/design-system/Card';

export const handle = { step: 'speakers' };

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  const user = await getUser(uid);
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  try {
    const proposal = await getSubmittedProposal(params.talk, params.event, user.id);
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

export const action = async ({ request, params }: ActionArgs) => {
  const { uid } = await sessionRequired(request);
  const form = await request.formData();
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  try {
    const action = form.get('_action');
    if (action === 'remove-speaker') {
      const speakerId = form.get('_speakerId')?.toString() as string;
      await removeCoSpeakerFromSubmission(uid, params.talk, params.event, speakerId);
      return json(null);
    } else {
      const result = await withZod(DetailsSchema).validate(form);
      if (result.error) return json(result.error.fieldErrors);

      await saveProfile(uid, result.data);
      const event = await getEvent(params.event);
      if (event.hasTracks) {
        return redirect(`/${params.event}/submission/${params.talk}/tracks`);
      } else if (event.surveyEnabled) {
        return redirect(`/${params.event}/submission/${params.talk}/survey`);
      } else {
        return redirect(`/${params.event}/submission/${params.talk}/submit`);
      }
    }
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export default function SubmissionSpeakerRoute() {
  const data = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();

  return (
    <>
      <H2>Speaker details</H2>
      <Card p={8}>
        <Form id="speakers-form" method="POST">
          <MarkdownTextArea
            name="bio"
            label="Biography"
            rows={5}
            error={errors?.bio}
            defaultValue={data.currentSpeaker.bio || ''}
          />
          <Text size="s" variant="secondary">
            You can give more information about you from{' '}
            <ExternalLink href="/speaker/settings">the profile page.</ExternalLink>
          </Text>
          <input type="hidden" name="references" value={data.currentSpeaker.references || ''} />
        </Form>
        <div className="mt-12">
          <H3 mb={0}>Co-speakers</H3>
          <Subtitle>When co-speaker accepts the invite, he/she will be automatically added to the proposal.</Subtitle>
          <div className="mt-6 space-y-6">
            {data.speakers.length > 1 && (
              <CoSpeakersList speakers={data.speakers} showRemoveAction className="max-w-md py-4" />
            )}
            <InviteCoSpeakerButton to="PROPOSAL" id={data.proposalId} invitationLink={data.invitationLink} />
          </div>
        </div>
      </Card>
    </>
  );
}
