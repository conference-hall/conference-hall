import { parseWithZod } from '@conform-to/zod';
import { type LoaderFunctionArgs, json } from '@remix-run/node';
import { Form, useFetcher, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { questions } from '~/.server/cfp-survey/survey-questions.ts';
import { UserEvent } from '~/.server/event-settings/user-event.ts';
import { EventSurveySettingsSchema } from '~/.server/event-settings/user-event.types.ts';
import { Button } from '~/design-system/buttons.tsx';
import { Checkbox } from '~/design-system/forms/checkboxes.tsx';
import { ToggleGroup } from '~/design-system/forms/toggles.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { toast } from '~/libs/toasts/toast.server.ts';

import { useEvent } from '../__components/use-event.tsx';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireSession(request);
  return { questions };
};

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');
  const event = UserEvent.for(userId, params.team, params.event);

  const form = await request.formData();
  const intent = form.get('intent');

  switch (intent) {
    case 'enable-survey': {
      const surveyEnabled = form.get('surveyEnabled') === 'true';
      await event.update({ surveyEnabled });
      return toast('success', `Speaker survey ${surveyEnabled ? 'enabled' : 'disabled'}`);
    }
    case 'save-questions': {
      const result = parseWithZod(form, { schema: EventSurveySettingsSchema });
      if (result.status !== 'success') return json(null);
      await event.update(result.value);
      return toast('success', 'Survey questions saved.');
    }
  }
  return null;
};

export default function EventSurveySettingsRoute() {
  const { event } = useEvent();
  const { questions } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  return (
    <>
      <Card as="section" p={8} className="space-y-6">
        <H2>Speaker survey</H2>

        <ToggleGroup
          label="Speaker survey activation"
          description="When enabled a short survey will be asked to speakers when they submit a proposal."
          value={event.surveyEnabled}
          onChange={(checked) =>
            fetcher.submit({ intent: 'enable-survey', surveyEnabled: String(checked) }, { method: 'POST' })
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
                key={question.id}
                id={question.id}
                name="surveyQuestions"
                value={question.id}
                defaultChecked={event.surveyQuestions.includes(question.id)}
                disabled={!event.surveyEnabled}
              >
                {question.label}
              </Checkbox>
            ))}
          </Form>
        </Card.Content>

        <Card.Actions>
          <Button
            type="submit"
            name="intent"
            value="save-questions"
            form="questions-form"
            disabled={!event.surveyEnabled}
          >
            Save questions
          </Button>
        </Card.Actions>
      </Card>
    </>
  );
}
