import { parse } from '@conform-to/zod';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Button, ButtonLink } from '~/design-system/Buttons.tsx';
import { MarkdownTextArea } from '~/design-system/forms/MarkdownTextArea.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { ExternalLink } from '~/design-system/Links.tsx';
import { H2, Subtitle, Text } from '~/design-system/Typography.tsx';
import { SpeakerProfile } from '~/domains/speaker/SpeakerProfile.ts';
import { DetailsSchema } from '~/domains/speaker/SpeakerProfile.types.ts';
import { EventSubmissionSettings } from '~/domains/submission-funnel/EventSubmissionSettings.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { CoSpeakersList, InviteCoSpeakerButton } from '~/routes/__components/proposals/forms/CoSpeaker.tsx';
import { getSubmittedProposal } from '~/routes/__server/proposals/get-submitted-proposal.server.ts';
import { removeCoSpeakerFromSubmission } from '~/routes/__server/proposals/remove-co-speaker.server.ts';

import { useSubmissionStep } from './__components/useSubmissionStep.ts';

export const handle = { step: 'speakers' };

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  const speaker = await SpeakerProfile.for(userId).get();
  const proposal = await getSubmittedProposal(params.talk, params.event, userId);
  return json({
    speaker,
    proposalId: proposal.id,
    invitationLink: proposal.invitationLink,
    speakers: proposal.speakers.filter((speaker) => speaker.id !== userId),
  });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
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
  await SpeakerProfile.for(userId).save(result.value);

  const settings = EventSubmissionSettings.for(params.event);
  if (await settings.hasTracks()) {
    return redirect(`/${params.event}/submission/${params.talk}/tracks`);
  } else if (await settings.hasSurvey()) {
    return redirect(`/${params.event}/submission/${params.talk}/survey`);
  } else {
    return redirect(`/${params.event}/submission/${params.talk}/submit`);
  }
};

export default function SubmissionSpeakerRoute() {
  const { speaker, speakers, invitationLink } = useLoaderData<typeof loader>();
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
            defaultValue={speaker.bio || ''}
            className="mb-3"
          />
          <Text variant="secondary">
            You can give more information about you from{' '}
            <ExternalLink href="/speaker/settings">the profile page.</ExternalLink>
          </Text>
          <input type="hidden" name="references" value={speaker.references || ''} />
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
