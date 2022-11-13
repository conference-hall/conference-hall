import type { ActionFunction, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { all, inputFromForm } from 'domain-functions';
import { Button, ButtonLink } from '~/design-system/Buttons';
import { getSurveyAnswers } from '~/services/events/survey/get-answers.server';
import { getSurveyQuestions } from '~/services/events/survey/get-questions.server';
import { saveSurvey } from '~/services/events/survey/save-survey.server';
import { EventSurveyForm } from '../../../../components/EventSurveyForm';
import { useSubmissionStep } from '../../../../components/useSubmissionStep';
import { H2, Text } from '../../../../design-system/Typography';
import { sessionRequired } from '../../../../services/auth/auth.server';
import { fromErrors } from '../../../../services/errors';

export const handle = { step: 'survey' };

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  const { eventSlug } = params;
  const result = await all(getSurveyQuestions, getSurveyAnswers)({ eventSlug, speakerId: uid });
  if (!result.success) throw fromErrors(result);
  const [questions, answers] = result.data;
  return json({ questions, answers });
};

export const action: ActionFunction = async ({ request, params }) => {
  const { uid } = await sessionRequired(request);
  const { eventSlug, talkId } = params;
  const data = await inputFromForm(request);
  const result = await saveSurvey({ speakerId: uid, eventSlug, data });
  if (!result.success) throw fromErrors(result);
  return redirect(`/${eventSlug}/submission/${talkId}/submit`);
};

export default function SubmissionSurveyRoute() {
  const { questions, answers } = useLoaderData<typeof loader>();
  const { previousPath } = useSubmissionStep();

  return (
    <Form method="post" className="pt-6 sm:px-8 sm:py-10">
      <div>
        <H2>We have some questions for you.</H2>
        <Text variant="secondary" className="mt-1">
          This information will be displayed publicly so be careful what you share.
        </Text>
      </div>
      <div className="mt-6">
        <EventSurveyForm questions={questions} initialValues={answers} />
      </div>
      <div className="my-4 flex justify-between gap-4 sm:flex-row sm:justify-end sm:px-8 sm:pb-4">
        <ButtonLink to={previousPath} variant="secondary">
          Back
        </ButtonLink>
        <Button type="submit">Next</Button>
      </div>
    </Form>
  );
}
