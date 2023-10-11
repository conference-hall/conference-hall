import { parse } from '@conform-to/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Button } from '~/design-system/Buttons.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { Container } from '~/design-system/layouts/Container.tsx';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { SurveyForm } from '~/routes/__components/proposals/forms/SurveyForm.tsx';
import { getAnswers } from '~/routes/__server/survey/get-answers.server.ts';
import { getQuestions } from '~/routes/__server/survey/get-questions.server.ts';
import { saveSurvey } from '~/routes/__server/survey/save-survey.server.ts';
import { SurveySchema } from '~/routes/__types/survey.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const questions = await getQuestions(params.event);
  const answers = await getAnswers(params.event, userId);
  return json({ questions, answers });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const form = await request.formData();
  const result = parse(form, { schema: SurveySchema });
  if (!result.value) return json(null);

  await saveSurvey(userId, params.event, result.value);
  return toast('success', 'Survey saved.');
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
