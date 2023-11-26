import { parse } from '@conform-to/zod';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, useFetcher, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Button } from '~/design-system/Buttons.tsx';
import { Checkbox } from '~/design-system/forms/Checkboxes.tsx';
import { ToggleGroup } from '~/design-system/forms/Toggles.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { H2, Subtitle } from '~/design-system/Typography.tsx';
import { questions } from '~/domains/cfp-survey/SurveyQuestions.ts';
import { UserEvent } from '~/domains/organizer-event-settings/UserEvent.ts';
import { EventSurveySettingsSchema } from '~/domains/organizer-event-settings/UserEvent.types.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { toast } from '~/libs/toasts/toast.server.ts';

import { useTeamEvent } from '../_layout.tsx';

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
      const result = parse(form, { schema: EventSurveySettingsSchema });
      if (!result.value) return json(null);
      await event.update(result.value);
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
