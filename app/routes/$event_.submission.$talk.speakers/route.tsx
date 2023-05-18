import { parse } from '@conform-to/zod';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { CoSpeakersList, InviteCoSpeakerButton } from '~/components/proposals/forms/CoSpeaker';
import { Button, ButtonLink } from '~/design-system/Buttons';
import { MarkdownTextArea } from '~/design-system/forms/MarkdownTextArea';
import { Card } from '~/design-system/layouts/Card';
import { ExternalLink } from '~/design-system/Links';
import { H2, Subtitle, Text } from '~/design-system/Typography';
import { requireSession } from '~/libs/auth/session';
import { useUser } from '~/root';
import { DetailsSchema } from '~/schemas/profile.schema';
import { getEvent } from '~/server/events/get-event.server';
import { saveUserDetails } from '~/server/profile/save-profile.server';
import { getSubmittedProposal } from '~/server/proposals/get-submitted-proposal.server';
import { removeCoSpeakerFromSubmission } from '~/server/proposals/remove-co-speaker.server';

import { useSubmissionStep } from '../$event_.submission/components/useSubmissionStep';

export const handle = { step: 'speakers' };

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  const proposal = await getSubmittedProposal(params.talk, params.event, userId);
  return json({
    proposalId: proposal.id,
    invitationLink: proposal.invitationLink,
    speakers: proposal.speakers.filter((speaker) => speaker.id !== userId),
  });
};

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await requireSession(request);
  const form = await request.formData();
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  const action = form.get('_action');
  if (action === 'remove-speaker') {
    const speakerId = form.get('_speakerId')?.toString() as string;
    await removeCoSpeakerFromSubmission(userId, params.talk, params.event, speakerId);
    return json(null);
  }

  const result = parse(form, { schema: DetailsSchema });
  if (!result.value) return json(result.error);
  await saveUserDetails(userId, result.value);

  const event = await getEvent(params.event);
  if (event.hasTracks) {
    return redirect(`/${params.event}/submission/${params.talk}/tracks`);
  } else if (event.surveyEnabled) {
    return redirect(`/${params.event}/submission/${params.talk}/survey`);
  } else {
    return redirect(`/${params.event}/submission/${params.talk}/submit`);
  }
};

export default function SubmissionSpeakerRoute() {
  const { user } = useUser();
  const { invitationLink, speakers } = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();
  const { previousPath } = useSubmissionStep();

  return (
    <Card>
      <Card.Title>
        <H2>Speaker details</H2>
      </Card.Title>
      <Card.Content>
        <Form id="speakers-form" method="POST">
          <MarkdownTextArea
            name="bio"
            label="Biography"
            rows={5}
            error={errors?.bio}
            defaultValue={user?.bio || ''}
            className="mb-3"
          />
          <Text variant="secondary">
            You can give more information about you from{' '}
            <ExternalLink href="/speaker/settings">the profile page.</ExternalLink>
          </Text>
          <input type="hidden" name="references" value={user?.references || ''} />
        </Form>
        <div className="mt-4">
          <H2>Co-speakers</H2>
          <Subtitle>When co-speaker accepts the invite, he/she will be automatically added to the proposal.</Subtitle>
          <div className="mt-6 space-y-6">
            {speakers.length > 1 && <CoSpeakersList speakers={speakers} showRemoveAction className="max-w-md py-4" />}
            <InviteCoSpeakerButton invitationLink={invitationLink} />
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
