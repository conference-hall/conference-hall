import { parse } from '@conform-to/zod';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import type { ActionFunction, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useLoaderData, useNavigate } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Button } from '~/design-system/Buttons.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { H2 } from '~/design-system/Typography.tsx';
import { EventSurvey } from '~/domains/event-survey/EventSurvey';
import { SpeakerAnswers } from '~/domains/event-survey/SpeakerAnswers';
import { SurveySchema } from '~/domains/event-survey/SpeakerAnswers.types';
import { SubmissionSteps } from '~/domains/submission-funnel/SubmissionSteps';
import { requireSession } from '~/libs/auth/session.ts';
import { SurveyForm } from '~/routes/__components/proposals/forms/SurveyForm.tsx';

export const handle = { step: 'survey' };

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const questions = await EventSurvey.of(params.event).questions();
  const answers = await SpeakerAnswers.for(params.event, userId).answers();
  return json({ questions, answers });
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireSession(request);
  const form = await request.formData();
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  const result = parse(form, { schema: SurveySchema });
  if (!result.value) return json(null);

  await SpeakerAnswers.for(params.event, userId).save(result.value);

  const nextStep = await SubmissionSteps.nextStepFor('survey', params.event, params.talk);
  return redirect(nextStep.path);
};

export default function SubmissionSurveyRoute() {
  const navigate = useNavigate();
  const { questions, answers } = useLoaderData<typeof loader>();

  return (
    <Card>
      <Card.Title>
        <H2>We have some questions for you</H2>
      </Card.Title>
      <Card.Content>
        <Form id="survey-form" method="POST">
          <SurveyForm questions={questions} initialValues={answers} />
        </Form>
      </Card.Content>
      <Card.Actions>
        <Button onClick={() => navigate(-1)} variant="secondary">
          Go back
        </Button>
        <Button type="submit" form="survey-form" iconRight={ArrowRightIcon}>
          Continue
        </Button>
      </Card.Actions>
    </Card>
  );
}
