import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, useFetcher, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { questions } from '~/.server/cfp-survey/SurveyQuestions.ts';
import { UserEvent } from '~/.server/event-settings/UserEvent.ts';
import { EventSurveySettingsSchema } from '~/.server/event-settings/UserEvent.types.ts';
import { Button } from '~/design-system/Buttons.tsx';
import { Checkbox } from '~/design-system/forms/Checkboxes.tsx';
import { ToggleGroup } from '~/design-system/forms/Toggles.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { H2, Subtitle } from '~/design-system/Typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { parseWithZod } from '~/libs/zod-parser.ts';

import { useEvent } from '../__components/useEvent.tsx';

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
  switch (form.get('_action')) {
    case 'enable-survey': {
      const surveyEnabled = form.get('surveyEnabled') === 'true';
      await event.update({ surveyEnabled });
      return toast('success', `Speaker survey ${surveyEnabled ? 'enabled' : 'disabled'}`);
    }
    case 'save-questions': {
      const result = parseWithZod(form, EventSurveySettingsSchema);
      if (!result.success) return json(null);
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
