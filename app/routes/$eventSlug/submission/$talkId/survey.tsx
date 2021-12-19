import { ActionFunction, Form, redirect, useLoaderData } from 'remix';
import { Button, ButtonLink } from '~/components/Buttons';
import { Heading } from '~/components/Heading';
import { usePreviousStep } from '~/features/event-submission/hooks/usePreviousStep';
import { loadSurvey, saveSurvey, SurveyQuestionsForm } from '~/features/event-submission/step-survey.server';
import { SurveyForm } from '../../../../features/event-submission/components/SurveyForm';

export const handle = { step: 'survey' };

export const loader = loadSurvey;

export const action: ActionFunction = async ({ request, params, context }) => {
  const { eventSlug, talkId } = params;
  await saveSurvey({ request, params, context });
  return redirect(`/${eventSlug}/submission/${talkId}/submit`);
};

export default function SubmissionSurveyRoute() {
  const { questions, initialValues } = useLoaderData<SurveyQuestionsForm>();
  const previousStepPath = usePreviousStep();

  return (
    <Form method="post">
      <div className="px-8 py-6 sm:py-10">
        <Heading description="This information will be displayed publicly so be careful what you share.">
          We have some questions for you.
        </Heading>
        <SurveyForm questions={questions} initialValues={initialValues} />
      </div>
      <div className="px-4 py-5 border-t border-gray-200 text-right sm:px-6">
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
