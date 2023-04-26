import invariant from 'tiny-invariant';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { InviteCoSpeakerButton, CoSpeakersList } from '../../shared-components/proposals/forms/CoSpeaker';
import { MarkdownTextArea } from '../../design-system/forms/MarkdownTextArea';
import { ExternalLink } from '../../design-system/Links';
import { H2, Subtitle, Text } from '../../design-system/Typography';
import { mapErrorToResponse } from '../../libs/errors';
import { getEvent } from '../../shared-server/events/get-event.server';
import { saveProfile } from '../../shared-server/profile/save-profile.server';
import { withZod } from '@remix-validated-form/with-zod';
import { removeCoSpeakerFromSubmission } from '~/shared-server/proposals/remove-co-speaker.server';
import { getSubmittedProposal } from '../../shared-server/proposals/get-submitted-proposal.server';
import { DetailsSchema } from '~/schemas/profile.schema';
import { Card } from '~/design-system/layouts/Card';
import { useUser } from '~/root';
import { requireSession } from '~/libs/auth/session';
import { Button, ButtonLink } from '~/design-system/Buttons';
import { useSubmissionStep } from '../$event_.submission/hooks/useSubmissionStep';
import { ArrowRightIcon } from '@heroicons/react/20/solid';

export const handle = { step: 'speakers' };

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  try {
    const proposal = await getSubmittedProposal(params.talk, params.event, uid);
    return json({
      proposalId: proposal.id,
      invitationLink: proposal.invitationLink,
      speakers: proposal.speakers.filter((speaker) => speaker.id !== uid),
    });
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export const action = async ({ request, params }: ActionArgs) => {
  const { uid } = await requireSession(request);
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
  const { user } = useUser();
  const { proposalId, invitationLink, speakers } = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();
  const { previousPath } = useSubmissionStep();

  return (
    <Card>
      <Card.Title>
        <H2 size="l">Speaker details</H2>
      </Card.Title>
      <Card.Content>
        <Form id="speakers-form" method="POST">
          <MarkdownTextArea name="bio" label="Biography" rows={5} error={errors?.bio} defaultValue={user?.bio || ''} />
          <Text size="s" variant="secondary">
            You can give more information about you from{' '}
            <ExternalLink href="/speaker/settings">the profile page.</ExternalLink>
          </Text>
          <input type="hidden" name="references" value={user?.references || ''} />
        </Form>
        <div className="mt-4">
          <H2 size="l">Co-speakers</H2>
          <Subtitle>When co-speaker accepts the invite, he/she will be automatically added to the proposal.</Subtitle>
          <div className="mt-6 space-y-6">
            {speakers.length > 1 && <CoSpeakersList speakers={speakers} showRemoveAction className="max-w-md py-4" />}
            <InviteCoSpeakerButton to="PROPOSAL" id={proposalId} invitationLink={invitationLink} />
          </div>
        </div>
      </Card.Content>
      <Card.Actions>
        <ButtonLink to={previousPath} variant="secondary">
          Go back
        </ButtonLink>
        <Button type="submit" form="speakers-form" iconRight={ArrowRightIcon}>
          Continue
        </Button>
      </Card.Actions>
    </Card>
  );
}
