import type { LoaderArgs } from '@remix-run/node';
import { sessionRequired } from '~/services/auth/auth.server';
import { H2, Text } from '~/design-system/Typography';
import { Button } from '~/design-system/Buttons';
import { Form, useLoaderData, useOutletContext } from '@remix-run/react';
import { Checkbox } from '~/design-system/forms/Checkboxes';
import type { OrganizerEventContext } from '../../$eventSlug';
import { updateEvent } from '~/services/organizers/event.server';
import { withZod } from '@remix-validated-form/with-zod';
import { EventSurveySettingsSchema } from '~/schemas/event';
import { QUESTIONS } from '~/services/event-survey/get-questions.server';

// TODO why not using event-survey#getQuestions?
export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return { questions: QUESTIONS };
};

export const action = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  const { slug, eventSlug } = params;
  const form = await request.formData();
  const action = form.get('_action');

  switch (action) {
    case 'enable-survey': {
      await updateEvent(slug!, eventSlug!, uid, { surveyEnabled: form.get('surveyEnabled') === 'true' });
      break;
    }
    case 'save-questions': {
      const result = await withZod(EventSurveySettingsSchema).validate(form);
      if (!result.error) await updateEvent(slug!, eventSlug!, uid, result.data);
      break;
    }
  }
  return null;
};

export default function EventSurveySettingsRoute() {
  const { event } = useOutletContext<OrganizerEventContext>();
  const { questions } = useLoaderData<typeof loader>();

  return (
    <>
      <section>
        <H2 className="border-b border-gray-200 pb-3">Speaker survey</H2>
        <Form method="post" className="mt-6 space-y-4">
          <Text variant="secondary">
            When enabled a short survey will be asked to speakers when they submit a proposal. It will provide some
            information about gender, transport or accommodation needs.
          </Text>
          <input type="hidden" name="_action" value="enable-survey" />
          <input type="hidden" name="surveyEnabled" value={String(!event.surveyEnabled)} />
          {event.surveyEnabled ? (
            <Button type="submit">Disable survey</Button>
          ) : (
            <Button type="submit">Enable survey</Button>
          )}
        </Form>
      </section>
      <section>
        <H2 className="border-b border-gray-200 pb-3">Questions</H2>
        <Text variant="secondary" className="mt-6">
          Select questions that you want to ask to speakers.
        </Text>
        <Form method="post" className="mt-6 space-y-4">
          <input type="hidden" name="_action" value="save-questions" />
          {questions.map((question) => (
            <Checkbox
              key={question.name}
              id={question.name}
              name="surveyQuestions"
              value={question.name}
              defaultChecked={event.surveyQuestions.includes(question.name)}
              disabled={!event.surveyEnabled}
            >
              {question.label}
            </Checkbox>
          ))}
          <Button type="submit" disabled={!event.surveyEnabled}>
            Save questions
          </Button>
        </Form>
      </section>
    </>
  );
}
