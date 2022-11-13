import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { json } from '@remix-run/node';
import { EventSurveyForm } from '~/components/EventSurveyForm';
import { AlertSuccess } from '~/design-system/Alerts';
import { Button } from '~/design-system/Buttons';
import { Container } from '~/design-system/Container';
import { H2, Text } from '~/design-system/Typography';
import { sessionRequired } from '~/services/auth/auth.server';
import { fromErrors } from '~/services/errors';
import { all, inputFromForm } from 'domain-functions';
import { getSurveyQuestions } from '~/services/events/survey/get-questions.server';
import { getSurveyAnswers } from '~/services/events/survey/get-answers.server';
import { saveSurvey } from '~/services/events/survey/save-survey.server';

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  const { eventSlug } = params;
  const result = await all(getSurveyQuestions, getSurveyAnswers)({ eventSlug, speakerId: uid });
  if (!result.success) throw fromErrors(result);
  const [questions, answers] = result.data;
  return json({ questions, answers });
};

export const action = async ({ request, params }: ActionArgs) => {
  const { uid } = await sessionRequired(request);
  const { eventSlug } = params;
  const data = await inputFromForm(request);
  const result = await saveSurvey({ speakerId: uid, eventSlug, data });
  if (!result.success) throw fromErrors(result);
  return json({ message: 'Survey saved, thank you!' });
};

export default function EventSurveyRoute() {
  const { questions, answers } = useLoaderData<typeof loader>();
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
