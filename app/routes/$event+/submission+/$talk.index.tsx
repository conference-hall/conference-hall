import { parseWithZod } from '@conform-to/zod';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useActionData, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';
import { TalkSubmission } from '~/.server/cfp-submission-funnel/talk-submission.ts';
import { TalksLibrary } from '~/.server/speaker-talks-library/talks-library.ts';
import { TalkSaveSchema } from '~/.server/speaker-talks-library/talks-library.types.ts';
import { Button, ButtonLink } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { TalkAlreadySubmittedError } from '~/libs/errors.server.ts';
import { TalkForm } from '~/routes/__components/talks/talk-forms/talk-form.tsx';
import { useCurrentStep } from './__components/submission-context.tsx';

export const handle = { step: 'proposal' };

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const speakerId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  if (params.talk === 'new') return null;

  const talk = TalksLibrary.of(speakerId).talk(params.talk);

  const alreadySubmitted = await talk.isSubmittedTo(params.event);
  if (alreadySubmitted) throw new TalkAlreadySubmittedError();

  return talk.get();
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const speakerId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  const form = await request.formData();
  const result = parseWithZod(form, { schema: TalkSaveSchema });
  if (result.status !== 'success') return result.error;

  const submission = TalkSubmission.for(speakerId, params.event);
  const proposal = await submission.saveDraft(params.talk, result.value);

  return redirect(`/${params.event}/submission/${proposal.talkId}/speakers`);
};

export default function SubmissionTalkRoute() {
  const talk = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();
  const currentStep = useCurrentStep();

  return (
    <Page>
      <Card>
        <Card.Title>
          <H2>Your proposal</H2>
        </Card.Title>
        <Card.Content>
          <TalkForm id="talk-form" initialValues={talk} errors={errors} />
        </Card.Content>
        <Card.Actions>
          {currentStep?.previousPath ? (
            <ButtonLink to={currentStep?.previousPath} variant="secondary">
              Go back
            </ButtonLink>
          ) : null}
          <Button type="submit" form="talk-form" iconRight={ArrowRightIcon}>
            Continue
          </Button>
        </Card.Actions>
      </Card>
    </Page>
  );
}
