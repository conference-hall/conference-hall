import invariant from 'tiny-invariant';
import type { ActionFunction, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { Button, ButtonLink } from '~/design-system/Buttons';
import { SurveySchema } from '~/schemas/survey';
import { getAnswers } from '~/shared-server/survey/get-answers.server';
import { SurveyForm } from '../../shared-components/proposal-forms/SurveyForm';
import { useSubmissionStep } from '../../shared-components/useSubmissionStep';
import { H2, Text } from '../../design-system/Typography';
import { sessionRequired } from '../../libs/auth/auth.server';
import { mapErrorToResponse } from '../../libs/errors';
import { getQuestions } from '~/shared-server/survey/get-questions.server';
import { saveSurvey } from '~/shared-server/survey/save-survey.server';

export const handle = { step: 'survey' };

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  try {
    const questions = await getQuestions(params.event);
    const answers = await getAnswers(params.event, uid);
    return json({ questions, answers });
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const { uid } = await sessionRequired(request);
  const form = await request.formData();
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  const result = await withZod(SurveySchema).validate(form);
  if (result.error) throw new Response('Bad survey values', { status: 400 });
  try {
    await saveSurvey(uid, params.event, result.data);
    return redirect(`/${params.event}/submission/${params.talk}/submit`);
  } catch (err) {
    mapErrorToResponse(err);
  }
};

export default function SubmissionSurveyRoute() {
  const { questions, answers } = useLoaderData<typeof loader>();
  const { previousPath } = useSubmissionStep();

  return (
    <Form method="post" className="pt-6 sm:px-8 sm:py-10">
      <div>
        <H2>We have some questions for you.</H2>
        <Text variant="secondary">This information will be displayed publicly so be careful what you share.</Text>
      </div>
      <div className="mt-6">
        <SurveyForm questions={questions} initialValues={answers} />
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
