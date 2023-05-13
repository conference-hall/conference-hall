import invariant from 'tiny-invariant';
import type { ActionFunction, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { SurveySchema } from '~/schemas/survey';
import { getAnswers } from '~/server/survey/get-answers.server';
import { getQuestions } from '~/server/survey/get-questions.server';
import { saveSurvey } from '~/server/survey/save-survey.server';
import { Card } from '~/design-system/layouts/Card';
import { requireSession } from '~/libs/auth/session';
import { Button, ButtonLink } from '~/design-system/Buttons';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useSubmissionStep } from '../$event_.submission/components/useSubmissionStep';
import { H2 } from '~/design-system/Typography';
import { SurveyForm } from '~/components/proposals/forms/SurveyForm';
import { parse } from '@conform-to/zod';

export const handle = { step: 'survey' };

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  const questions = await getQuestions(params.event);
  const answers = await getAnswers(params.event, userId);
  return json({ questions, answers });
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireSession(request);
  const form = await request.formData();
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  const result = parse(form, { schema: SurveySchema });
  if (!result.value) return json(null);

  await saveSurvey(userId, params.event, result.value);
  return redirect(`/${params.event}/submission/${params.talk}/submit`);
};

export default function SubmissionSurveyRoute() {
  const { questions, answers } = useLoaderData<typeof loader>();
  const { previousPath } = useSubmissionStep();

  return (
    <Card>
      <Card.Title>
        <H2 size="base">We have some questions for you</H2>
      </Card.Title>
      <Card.Content>
        <Form id="survey-form" method="POST">
          <SurveyForm questions={questions} initialValues={answers} />
        </Form>
      </Card.Content>
      <Card.Actions>
        <ButtonLink to={previousPath} variant="secondary">
          Go back
        </ButtonLink>
        <Button type="submit" form="survey-form" iconRight={ArrowRightIcon}>
          Continue
        </Button>
      </Card.Actions>
    </Card>
  );
}
