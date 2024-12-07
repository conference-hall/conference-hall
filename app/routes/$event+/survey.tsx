import { parseWithZod } from '@conform-to/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { useActionData, useLoaderData } from 'react-router';
import invariant from 'tiny-invariant';

import { Button } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { toast } from '~/libs/toasts/toast.server.ts';

import { SpeakerSurvey } from '~/.server/event-survey/speaker-survey.ts';
import { SurveyForm } from '../__components/talks/talk-forms/survey-form.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const survey = SpeakerSurvey.for(params.event);
  const questions = await survey.getQuestions();
  const answers = await survey.getSpeakerAnswers(userId);

  return { questions, answers };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const survey = SpeakerSurvey.for(params.event);
  const schema = await survey.buildSurveySchema();

  const form = await request.formData();
  const result = parseWithZod(form, { schema });
  if (result.status !== 'success') return result.error;

  await survey.saveSpeakerAnswer(userId, result.value);
  return toast('success', 'Survey saved.');
};

export default function EventSurveyRoute() {
  const { questions, answers } = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();

  return (
    <Page>
      <Page.Heading
        title="We have some questions for you."
        subtitle="This information are asked by the organizers to give you a better speaker experience."
      />

      <Card>
        <Card.Content>
          <SurveyForm id="survey-form" questions={questions} initialValues={answers} errors={errors} />
        </Card.Content>
        <Card.Actions>
          <Button type="submit" form="survey-form">
            Save survey
          </Button>
        </Card.Actions>
      </Card>
    </Page>
  );
}
