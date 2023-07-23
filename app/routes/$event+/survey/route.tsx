import { parse } from '@conform-to/zod';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { SurveyForm } from '~/components/proposals/forms/SurveyForm';
import { Button } from '~/design-system/Buttons';
import { Card } from '~/design-system/layouts/Card';
import { Container } from '~/design-system/layouts/Container';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle';
import { requireSession } from '~/libs/auth/session';
import { addToast } from '~/libs/toasts/toasts';
import { SurveySchema } from '~/schemas/survey';
import { getAnswers } from '~/server/survey/get-answers.server';
import { getQuestions } from '~/server/survey/get-questions.server';
import { saveSurvey } from '~/server/survey/save-survey.server';

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const questions = await getQuestions(params.event);
  const answers = await getAnswers(params.event, userId);
  return json({ questions, answers });
};

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const form = await request.formData();
  const result = parse(form, { schema: SurveySchema });
  if (!result.value) return json(null);

  await saveSurvey(userId, params.event, result.value);
  return json(null, await addToast(request, 'Survey saved.'));
};

export default function EventSurveyRoute() {
  const { questions, answers } = useLoaderData<typeof loader>();

  return (
    <>
      <PageHeaderTitle
        title="We have some questions for you."
        subtitle="This information are asked by the organizers to give you a better speaker experience."
      />

      <Container className="mt-4 space-y-8 sm:mt-8">
        <Card>
          <Card.Content>
            <Form id="survey-form" method="POST">
              <SurveyForm questions={questions} initialValues={answers} />
            </Form>
          </Card.Content>
          <Card.Actions>
            <Button type="submit" form="survey-form">
              Save survey
            </Button>
          </Card.Actions>
        </Card>
      </Container>
    </>
  );
}