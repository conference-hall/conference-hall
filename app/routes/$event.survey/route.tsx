import invariant from 'tiny-invariant';
import type { ActionArgs, LoaderFunction } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { json } from '@remix-run/node';
import { SurveyForm } from '~/shared-components/proposal-forms/SurveyForm';
import { Button } from '~/design-system/Buttons';
import { Container } from '~/design-system/Container';
import { H2, Subtitle } from '~/design-system/Typography';
import { sessionRequired } from '~/libs/auth/auth.server';
import { mapErrorToResponse } from '~/libs/errors';
import type { SurveyQuestions } from '~/schemas/survey';
import { SurveySchema } from '~/schemas/survey';
import { withZod } from '@remix-validated-form/with-zod';
import { getAnswers } from '~/shared-server/survey/get-answers.server';
import { getQuestions } from '~/shared-server/survey/get-questions.server';
import { saveSurvey } from '~/shared-server/survey/save-survey.server';
import { Card } from '~/design-system/Card';

type SurveyQuestionsForm = {
  questions: SurveyQuestions;
  answers: Record<string, unknown>;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const { uid } = await sessionRequired(request);
  invariant(params.event, 'Invalid event slug');

  try {
    const questions = await getQuestions(params.event);
    const answers = await getAnswers(params.event, uid);
    return json<SurveyQuestionsForm>({ questions, answers });
  } catch (err) {
    mapErrorToResponse(err);
  }
};

export const action = async ({ request, params }: ActionArgs) => {
  const { uid } = await sessionRequired(request);
  invariant(params.event, 'Invalid event slug');
  const form = await request.formData();

  const result = await withZod(SurveySchema).validate(form);
  if (result.error) throw new Response('Bad survey values', { status: 400 });
  try {
    await saveSurvey(uid, params.event, result.data);
    return json({ message: 'Survey saved, thank you!' });
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export default function EventSurveyRoute() {
  const { questions, answers } = useLoaderData<SurveyQuestionsForm>();

  return (
    <Container className="mt-4 sm:my-8">
      <div>
        <H2 mb={1}>We have some questions for you.</H2>
        <Subtitle mb={8}>This information are asked by the organizers to give a better experience.</Subtitle>
      </div>

      <Card rounded="2xl" p={8}>
        <Form aria-labelledby="survey-form-label" method="POST">
          <SurveyForm questions={questions} initialValues={answers} />
          <div className="mt-8 text-right">
            <Button type="submit" className="w-full sm:w-fit">
              Save survey
            </Button>
          </div>
        </Form>
      </Card>
    </Container>
  );
}
