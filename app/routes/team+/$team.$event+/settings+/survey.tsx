import { parse } from '@conform-to/zod';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, useFetcher, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Button } from '~/design-system/Buttons.tsx';
import { Checkbox } from '~/design-system/forms/Checkboxes.tsx';
import { ToggleGroup } from '~/design-system/forms/Toggles.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { H2, Subtitle } from '~/design-system/Typography.tsx';
import { questions } from '~/domains/event-survey/SurveyQuestions.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { updateEvent } from '~/routes/__server/teams/update-event.server.ts';

import { useTeamEvent } from '../_layout.tsx';
import { EventSurveySettingsSchema } from './__types/event-survey-settings.schema.ts';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireSession(request);
  return { questions };
};

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  const form = await request.formData();
  const action = form.get('_action');

  switch (action) {
    case 'enable-survey': {
      const surveyEnabled = form.get('surveyEnabled') === 'true';
      await updateEvent(params.event, userId, { surveyEnabled });
      return toast('success', `Speaker survey ${surveyEnabled ? 'enabled' : 'disabled'}`);
    }
    case 'save-questions': {
      const result = parse(form, { schema: EventSurveySettingsSchema });
      if (!result.value) return json(null);
      await updateEvent(params.event, userId, result.value);
      return toast('success', 'Survey questions saved.');
    }
  }
  return null;
};

export default function EventSurveySettingsRoute() {
  const { event } = useTeamEvent();
  const { questions } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  return (
    <>
      <Card as="section" p={8} className="space-y-6">
        <H2>Speaker survey</H2>

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
          <H2>Survey questions</H2>
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
