import { ActionFunction, Form, redirect, useActionData, useLoaderData } from 'remix';
import { Button } from '~/components/Buttons';
import { Heading } from '~/components/Heading';
import { Container } from '~/components/layout/Container';
import { loadSurvey, saveSurvey, SurveyQuestionsForm } from '~/features/event-submission/step-survey.server';
import { SurveyForm } from '~/features/event-submission/components/SurveyForm';
import SuccessAlert from '../../components/Alert';

export const loader = loadSurvey;

export const action: ActionFunction = async ({ request, params, context }) => {
  await saveSurvey({ request, params, context });
  return { message: 'Survey saved, thank you!' }
};

export default function EventSurveyRoute() {
  const { questions, initialValues } = useLoaderData<SurveyQuestionsForm>();
  const result = useActionData();

  return (
    <Container className="mt-8">
      <Heading description="This information will be displayed publicly so be careful what you share.">
        We have some questions for you.
      </Heading>
      <Form method="post">
        {result?.message && <SuccessAlert message={result?.message} className="mt-8" />}
        <div className="bg-white border border-gray-200 rounded-md px-6 mt-8">
          <SurveyForm questions={questions} initialValues={initialValues} />
          <div className="py-5 text-right">
            <Button type="submit">
              Save survey
            </Button>
          </div>
        </div>
      </Form>
    </Container>
  );
}
