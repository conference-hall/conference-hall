import type { ActionArgs, LoaderFunction } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { json } from '@remix-run/node';
import { EventSurveyForm } from '~/components/EventSurveyForm';
import { AlertSuccess } from '~/design-system/Alerts';
import { Button } from '~/design-system/Buttons';
import { Container } from '~/design-system/Container';
import { H2, Text } from '~/design-system/Typography';
import { sessionRequired } from '~/services/auth/auth.server';
import { mapErrorToResponse } from '~/services/errors';
import { getSurveyAnswers, getSurveyQuestions, saveSurvey } from '~/services/events/survey.server';
import type { SurveyQuestions } from '~/schemas/survey';
import { SurveySchema } from '~/schemas/survey';
import { withZod } from '@remix-validated-form/with-zod';

type SurveyQuestionsForm = {
  questions: SurveyQuestions;
  answers: Record<string, unknown>;
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

export const action = async ({ request, params }: ActionArgs) => {
  const uid = await sessionRequired(request);
  const slug = params.eventSlug!;
  const form = await request.formData();
  const result = await withZod(SurveySchema).validate(form);
  if (result.error) throw new Response('Bad survey values', { status: 400 });
  try {
    await saveSurvey(uid, slug, result.data);
    return json({ message: 'Survey saved, thank you!' });
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export default function EventSurveyRoute() {
  const { questions, answers } = useLoaderData<SurveyQuestionsForm>();
  const result = useActionData<typeof action>();

  return (
    <Container className="mt-4 sm:my-8">
      <div>
        <H2 id="survey-form-label">We have some questions for you.</H2>
        <Text variant="secondary" className="mt-1">
          This information will be displayed publicly so be careful what you share.
        </Text>
      </div>
      {result?.message && <AlertSuccess className="mt-8">{result?.message}</AlertSuccess>}
      <Form
        aria-labelledby="survey-form-label"
        className="mt-8 sm:overflow-hidden sm:rounded-md sm:border sm:border-gray-200"
        method="post"
      >
        <div className="bg-white sm:p-6">
          <EventSurveyForm questions={questions} initialValues={answers} />
        </div>
        <div className="space-x-4 py-8 sm:bg-gray-50 sm:py-3 sm:px-6 sm:text-right">
          <Button type="submit" className="w-full sm:w-fit">
            Save survey
          </Button>
        </div>
      </Form>
    </Container>
  );
}
