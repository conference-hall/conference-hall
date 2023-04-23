import invariant from 'tiny-invariant';
import type { LoaderArgs } from '@remix-run/node';
import { requireSession } from '~/libs/auth/session';
import { H2, Subtitle } from '~/design-system/Typography';
import { Button } from '~/design-system/Buttons';
import { Form, useLoaderData } from '@remix-run/react';
import { Checkbox } from '~/design-system/forms/Checkboxes';
import { useOrganizerEvent } from '../organizer.$orga.$event/route';
import { withZod } from '@remix-validated-form/with-zod';
import { updateEvent } from '~/shared-server/organizations/update-event.server';
import { QUESTIONS } from '~/shared-server/survey/get-questions.server';
import { EventSurveySettingsSchema } from './types/event-survey-settings.schema';
import { Card } from '~/design-system/layouts/Card';
import { AlertInfo } from '~/design-system/Alerts';

// TODO why not using event-survey#getQuestions?
export const loader = async ({ request }: LoaderArgs) => {
  await requireSession(request);
  return { questions: QUESTIONS };
};

export const action = async ({ request, params }: LoaderArgs) => {
  const { uid } = await requireSession(request);
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
      <Card as="section">
        <Card.Title>
          <H2 size="xl">Speaker survey</H2>
        </Card.Title>

        <Card.Content>
          <AlertInfo>
            When enabled a short survey will be asked to speakers when they submit a proposal. It will provide some
            information about gender, transport or accommodation needs.
          </AlertInfo>
        </Card.Content>

        <Card.Actions>
          <Form method="POST">
            <input type="hidden" name="_action" value="enable-survey" />
            <input type="hidden" name="surveyEnabled" value={String(!event.surveyEnabled)} />
            {event.surveyEnabled ? (
              <Button type="submit">Disable survey</Button>
            ) : (
              <Button type="submit">Enable survey</Button>
            )}
          </Form>
        </Card.Actions>
      </Card>

      <Card as="section">
        <Card.Title>
          <H2 size="xl">Survey questions</H2>
          <Subtitle>Select questions that you want to ask to speakers.</Subtitle>
        </Card.Title>

        <Card.Content>
          <Form method="POST" id="questions-form" className="space-y-4">
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
            <input type="hidden" name="_action" value="save-questions" />
          </Form>
        </Card.Content>

        <Card.Actions>
          <Button type="submit" form="questions-form" disabled={!event.surveyEnabled}>
            Save questions
          </Button>
        </Card.Actions>
      </Card>
    </>
  );
}
