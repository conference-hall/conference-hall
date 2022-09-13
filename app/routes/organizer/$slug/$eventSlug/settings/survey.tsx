import type { LoaderArgs } from '@remix-run/node';
import { sessionRequired } from '~/services/auth/auth.server';
import { H2, Text } from '~/design-system/Typography';
import { Button } from '~/design-system/Buttons';
import { Form, useLoaderData, useOutletContext } from '@remix-run/react';
import { QUESTIONS } from '~/services/events/survey.server';
import { Checkbox } from '~/design-system/forms/Checkboxes';
import type { OrganizerEventContext } from '../../$eventSlug';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return { questions: QUESTIONS };
};

export default function EventSurveySettingsRoute() {
  const { event } = useOutletContext<OrganizerEventContext>();
  const { questions } = useLoaderData<typeof loader>();
  return (
    <>
      <section>
        <H2 className="border-b border-gray-200 pb-3">Speaker survey</H2>
        <Text variant="secondary" className="mt-6">
          When enabled a short survey will be asked to speakers when they submit a proposal. It will provide some
          information about gender, transport or accommodation needs.
        </Text>
        {event.surveyEnabled ? (
          <Button className="mt-6">Disable survey</Button>
        ) : (
          <Button className="mt-6">Enable survey</Button>
        )}
      </section>
      <section>
        <H2 className="border-b border-gray-200 pb-3">Questions</H2>
        <Text variant="secondary" className="mt-6">
          Select questions that you want to ask to speakers.
        </Text>
        <Form className="mt-6 space-y-4">
          {questions.map((question) => (
            <Checkbox
              key={question.name}
              name="questions"
              value={question.name}
              defaultChecked={event.surveyQuestions.includes(question.name)}
              disabled={!event.surveyEnabled}
            >
              {question.label}
            </Checkbox>
          ))}
          <Button disabled={!event.surveyEnabled}>Save questions</Button>
        </Form>
      </section>
    </>
  );
}
