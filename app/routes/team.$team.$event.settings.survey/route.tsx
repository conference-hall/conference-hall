import invariant from 'tiny-invariant';
import { json, type LoaderArgs } from '@remix-run/node';
import { requireSession } from '~/libs/auth/session';
import { H2, Subtitle } from '~/design-system/Typography';
import { Button } from '~/design-system/Buttons';
import { Form, useFetcher, useLoaderData } from '@remix-run/react';
import { Checkbox } from '~/design-system/forms/Checkboxes';
import { useOrganizerEvent } from '../team.$team.$event/route';
import { updateEvent } from '~/server/teams/update-event.server';
import { QUESTIONS } from '~/server/survey/get-questions.server';
import { EventSurveySettingsSchema } from './types/event-survey-settings.schema';
import { Card } from '~/design-system/layouts/Card';
import { ToggleGroup } from '~/design-system/forms/Toggles';
import { addToast } from '~/libs/toasts/toasts';
import { parse } from '@conform-to/zod';

// TODO why not using event-survey#getQuestions?
export const loader = async ({ request }: LoaderArgs) => {
  await requireSession(request);
  return { questions: QUESTIONS };
};

export const action = async ({ request, params }: LoaderArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  const form = await request.formData();
  const action = form.get('_action');

  switch (action) {
    case 'enable-survey': {
      const surveyEnabled = form.get('surveyEnabled') === 'true';
      await updateEvent(params.event, userId, { surveyEnabled });
      return json(null, await addToast(request, `Speaker survey ${surveyEnabled ? 'enabled' : 'disabled'}`));
    }
    case 'save-questions': {
      const result = parse(form, { schema: EventSurveySettingsSchema });
      if (!result.value) return json(null);
      await updateEvent(params.event, userId, result.value);
      return json(null, await addToast(request, 'Survey questions saved.'));
    }
  }
  return null;
};

export default function EventSurveySettingsRoute() {
  const { event } = useOrganizerEvent();
  const { questions } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  return (
    <>
      <Card as="section" p={8} className="space-y-6">
        <H2 size="base">Speaker survey</H2>

        <ToggleGroup
          label="Speaker survey activation"
          description="When enabled a short survey will be asked to speakers when they submit a proposal."
          value={event.surveyEnabled}
          onChange={(checked) =>
            fetcher.submit({ _action: 'enable-survey', surveyEnabled: String(checked) }, { method: 'POST' })
          }
        />
      </Card>

      <Card as="section">
        <Card.Title>
          <H2 size="base">Survey questions</H2>
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
