import { ActionFunction, Form, useActionData, useLoaderData } from 'remix';
import { Button } from '~/components/Buttons';
import { Container } from '~/components/layout/Container';
import { loadSurvey, saveSurvey, SurveyQuestionsForm } from '~/features/event-submission/step-survey.server';
import { SurveyForm } from '~/features/event-submission/components/SurveyForm';
import { AlertSuccess } from '../../components/Alerts';
import { H2, Text } from '../../components/Typography';

export const loader = loadSurvey;

export const action: ActionFunction = async ({ request, params, context }) => {
  await saveSurvey({ request, params, context });
  return { message: 'Survey saved, thank you!' };
};

export default function EventSurveyRoute() {
  const { questions, initialValues } = useLoaderData<SurveyQuestionsForm>();
  const result = useActionData();

  return (
    <Container className="my-8">
      <div>
        <H2>We have some questions for you.</H2>
        <Text variant="secondary" className="mt-1">
          This information will be displayed publicly so be careful what you share.
        </Text>
      </div>
      <Form method="post">
        {result?.message && <AlertSuccess className="mt-8">{result?.message}</AlertSuccess>}
        <SurveyForm questions={questions} initialValues={initialValues} />
        <div className="py-5 mt-12 text-right border-t border-gray-200">
          <Button type="submit">Save survey</Button>
        </div>
      </Form>
    </Container>
  );
}
