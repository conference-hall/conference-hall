import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { Button } from '~/design-system/Buttons';
import { Container } from '~/design-system/Container';
import { EventSurveyForm } from '../../../components/EventSurveyForm';
import { AlertSuccess } from '../../../design-system/Alerts';
import { H2, Text } from '../../../design-system/Typography';
import { sessionRequired } from '../../../services/auth/auth.server';
import { mapErrorToResponse } from '../../../services/errors';
import type { SurveyAnswers, SurveyQuestions } from '../../../services/events/survey.server';
import {
  getSurveyAnswers,
  getSurveyQuestions,
  saveSurvey,
  validateSurveyForm,
} from '../../../services/events/survey.server';

type SurveyQuestionsForm = {
  questions: SurveyQuestions;
  answers: SurveyAnswers;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const uid = await sessionRequired(request);
  const slug = params.eventSlug!;
  try {
    const questions = await getSurveyQuestions(slug);
    const answers = await getSurveyAnswers(slug, uid);
    return json<SurveyQuestionsForm>({ questions, answers });
  } catch (err) {
    mapErrorToResponse(err);
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const uid = await sessionRequired(request);
  const slug = params.eventSlug!;
  const form = await request.formData();
  const result = validateSurveyForm(form);
  if (!result.success) throw new Response('Bad survey values', { status: 400 });
  try {
    await saveSurvey(uid, slug, result.data);
    return { message: 'Survey saved, thank you!' };
  } catch (err) {
    mapErrorToResponse(err);
  }
};

export default function EventSurveyRoute() {
  const { questions, answers } = useLoaderData<SurveyQuestionsForm>();
  const result = useActionData();

  return (
    <Container className="my-8">
      <div>
        <H2 id="survey-form-label">We have some questions for you.</H2>
        <Text variant="secondary" className="mt-1">
          This information will be displayed publicly so be careful what you share.
        </Text>
      </div>
      {result?.message && <AlertSuccess className="mt-8">{result?.message}</AlertSuccess>}
      <Form
        aria-labelledby="survey-form-label"
        method="post"
        className="mt-8 border border-gray-200 sm:overflow-hidden sm:rounded-md"
      >
        <div className="bg-white py-6 px-4 sm:p-6">
          <EventSurveyForm questions={questions} initialValues={answers} />
        </div>
        <div className="space-x-4 bg-gray-50 px-4 py-3 text-right sm:px-6">
          <Button type="submit">Save survey</Button>
        </div>
      </Form>
    </Container>
  );
}
