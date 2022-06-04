import { ActionFunction, json, LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { Button, ButtonLink } from '~/components/Buttons';
import { H2, Text } from '../../../../components/Typography';
import { requireUserSession } from '../../../../services/auth/auth.server';
import { getSurveyAnswers, getSurveyQuestions, saveSurvey, SurveyAnswers, SurveyQuestions, validateSurveyForm } from '../../../../services/events/survey.server';
import { SurveyForm } from '../../components/SurveyForm';
import { usePreviousStep } from '../../components/usePreviousStep';

type SurveyQuestionsForm = {
  questions: SurveyQuestions;
  answers: SurveyAnswers;
};

export const handle = { step: 'survey' };

export const loader: LoaderFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const slug = params.eventSlug!;
  try {
    const questions = await getSurveyQuestions(slug);
    const answers = await getSurveyAnswers(slug, uid);
    return json<SurveyQuestionsForm>({ questions, answers });
  } catch (err) {
    throw new Response('Event not found', { status: 404 });
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const slug = params.eventSlug!;
  const talkId = params.talkId!;
  const form = await request.formData();
  const result = validateSurveyForm(form);
  if (!result.success) throw new Response('Bad survey values', { status: 400 });
  try {
    await saveSurvey(uid, slug, result.data);
    return redirect(`/${slug}/submission/${talkId}/submit`);
  } catch (err) {
    throw new Response('Event not found', { status: 404 });
  }
};

export default function SubmissionSurveyRoute() {
  const { questions, answers } = useLoaderData<SurveyQuestionsForm>();
  const previousStepPath = usePreviousStep();

  return (
    <Form method="post">
      <div className="px-8 py-6 sm:py-10">
        <div>
          <H2>We have some questions for you.</H2>
          <Text variant="secondary" className="mt-1">
            This information will be displayed publicly so be careful what you share.
          </Text>
        </div>
        <div className="mt-6">
          <SurveyForm questions={questions} initialValues={answers} />
        </div>
      </div>
      <div className="px-4 py-5 text-right sm:px-6">
        <ButtonLink to={previousStepPath} variant="secondary">
          Back
        </ButtonLink>
        <Button type="submit" className="ml-4">
          Next
        </Button>
      </div>
    </Form>
  );
}
