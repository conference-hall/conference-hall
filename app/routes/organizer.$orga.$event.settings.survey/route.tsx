import invariant from 'tiny-invariant';
import type { LoaderArgs } from '@remix-run/node';
import { sessionRequired } from '~/libs/auth/auth.server';
import { H2, Text } from '~/design-system/Typography';
import { Button } from '~/design-system/Buttons';
import { Form, useLoaderData } from '@remix-run/react';
import { Checkbox } from '~/design-system/forms/Checkboxes';
import { useOrganizerEvent } from '../organizer.$orga.$event/route';
import { withZod } from '@remix-validated-form/with-zod';
import { updateEvent } from '~/shared-server/organizations/update-event.server';
import { QUESTIONS } from '~/shared-server/survey/get-questions.server';
import { EventSurveySettingsSchema } from './types/event-survey-settings.schema';

// TODO why not using event-survey#getQuestions?
export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return { questions: QUESTIONS };
};

export const action = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  invariant(params.orga, 'Invalid organization slug');
  invariant(params.event, 'Invalid event slug');
  const form = await request.formData();
  const action = form.get('_action');

  switch (action) {
    case 'enable-survey': {
      await updateEvent(params.orga, params.event, uid, { surveyEnabled: form.get('surveyEnabled') === 'true' });
      break;
    }
    case 'save-questions': {
      const result = await withZod(EventSurveySettingsSchema).validate(form);
      if (!result.error) await updateEvent(params.orga, params.event, uid, result.data);
      break;
    }
  }
  return null;
};

export default function EventSurveySettingsRoute() {
  const { event } = useOrganizerEvent();
  const { questions } = useLoaderData<typeof loader>();

  return (
    <>
      <section>
        <H2>Speaker survey</H2>
        <Form method="POST" className="mt-6 space-y-4">
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
        <H2>Questions</H2>
        <Text variant="secondary">Select questions that you want to ask to speakers.</Text>
        <Form method="POST" className="mt-6 space-y-4">
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
