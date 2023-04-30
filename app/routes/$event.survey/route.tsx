import invariant from 'tiny-invariant';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { json } from '@remix-run/node';
import { SurveyForm } from '~/shared-components/proposals/forms/SurveyForm';
import { Button } from '~/design-system/Buttons';
import { Container } from '~/design-system/layouts/Container';
import { requireSession } from '~/libs/auth/session';
import { SurveySchema } from '~/schemas/survey';
import { withZod } from '@remix-validated-form/with-zod';
import { getAnswers } from '~/shared-server/survey/get-answers.server';
import { getQuestions } from '~/shared-server/survey/get-questions.server';
import { saveSurvey } from '~/shared-server/survey/save-survey.server';
import { Card } from '~/design-system/layouts/Card';
import { createToast } from '~/libs/toasts/toasts';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle';

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
  const result = await withZod(SurveySchema).validate(form);
  if (result.error) throw new Response('Bad survey values', { status: 400 });

  await saveSurvey(userId, params.event, result.data);

  return json(null, await createToast(request, 'Survey successfully saved.'));
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
