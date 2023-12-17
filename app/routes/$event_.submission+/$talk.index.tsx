import { parse } from '@conform-to/zod';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData, useNavigate } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { SubmissionSteps } from '~/.server/cfp-submission-funnel/SubmissionSteps';
import { TalkSubmission } from '~/.server/cfp-submission-funnel/TalkSubmission';
import { TalksLibrary } from '~/.server/speaker-talks-library/TalksLibrary';
import { TalkSaveSchema } from '~/.server/speaker-talks-library/TalksLibrary.types';
import { Button } from '~/design-system/Buttons.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { H2 } from '~/design-system/Typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { DetailsForm } from '~/routes/__components/proposals/forms/DetailsForm.tsx';

export const handle = { step: 'proposal' };

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const speakerId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  if (params.talk === 'new') return json(null);

  const talk = TalksLibrary.of(speakerId).talk(params.talk);

  const alreadySubmitted = await talk.isSubmittedTo(params.event);
  if (alreadySubmitted) throw new Response('Talk already submitted.', { status: 400 });

  return json(await talk.get());
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const speakerId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  const result = parse(await request.formData(), { schema: TalkSaveSchema });
  if (!result.value) return json(result.error);

  const submission = TalkSubmission.for(speakerId, params.event);
  const proposal = await submission.saveDraft(params.talk, result.value);

  const nextStep = await SubmissionSteps.nextStepFor('proposal', params.event, proposal.talkId);
  return redirect(nextStep.path);
};

export default function SubmissionProposalRoute() {
  const navigate = useNavigate();
  const talk = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();

  return (
    <Card>
      <Card.Title>
        <H2>Your proposal</H2>
      </Card.Title>
      <Card.Content>
        <Form id="proposal-form" method="POST">
          <DetailsForm initialValues={talk} errors={errors} />
        </Form>
      </Card.Content>
      <Card.Actions>
        <Button onClick={() => navigate(-1)} variant="secondary">
          Go back
        </Button>
        <Button type="submit" form="proposal-form" iconRight={ArrowRightIcon}>
          Continue
        </Button>
      </Card.Actions>
    </Card>
  );
}
