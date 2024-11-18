import { Form, useFetcher } from '@remix-run/react';
import { Button } from '~/design-system/buttons.tsx';
import { Checkbox } from '~/design-system/forms/checkboxes.tsx';
import { ToggleGroup } from '~/design-system/forms/toggles.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2 } from '~/design-system/typography.tsx';
import type { SerializeFrom } from '~/types/remix.types.ts';
import type { action, loader } from '../../survey.tsx';

type LegacySurveySettingsFormProps = { config: SerializeFrom<typeof loader> };

export function LegacySurveySettingsForm({ config }: LegacySurveySettingsFormProps) {
  const fetcher = useFetcher<typeof action>();

  return (
    <Card as="section">
      <Card.Title>
        <H2>Speaker survey</H2>
      </Card.Title>

      <Card.Content>
        <ToggleGroup
          label="Speaker survey activation"
          description="When enabled a short survey will be asked to speakers when they submit a proposal."
          value={config.enabled}
          onChange={(checked) =>
            fetcher.submit({ intent: 'toggle-legacy-survey', surveyEnabled: String(checked) }, { method: 'POST' })
          }
        />

        <Form method="POST" id="questions-form" className="space-y-4">
          {config.questions.map((question) => (
            <Checkbox
              key={question.id}
              id={question.id}
              name="activeQuestions"
              value={question.id}
              defaultChecked={config.activeQuestions?.includes(question.id)}
              disabled={!config.enabled}
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
          value="update-legacy-questions"
          form="questions-form"
          disabled={!config.enabled}
        >
          Save questions
        </Button>
      </Card.Actions>
    </Card>
  );
}
