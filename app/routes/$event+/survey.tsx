import { parseWithZod } from '@conform-to/zod';
import { SpeakerSurvey } from '~/.server/event-survey/speaker-survey.ts';
import { Button } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { SurveyForm } from '../__components/talks/talk-forms/survey-form.tsx';
import type { Route } from './+types/survey.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const userId = await requireSession(request);
  const survey = SpeakerSurvey.for(params.event);
  const questions = await survey.getQuestions();
  const answers = await survey.getSpeakerAnswers(userId);

  return { questions, answers };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const userId = await requireSession(request);
  const survey = SpeakerSurvey.for(params.event);
  const schema = await survey.buildSurveySchema();
  const form = await request.formData();
  const result = parseWithZod(form, { schema });

  if (result.status !== 'success') return result.error;
  await survey.saveSpeakerAnswer(userId, result.value);

  return toast('success', 'Survey saved.');
};

export default function EventSurveyRoute({ loaderData, actionData: errors }: Route.ComponentProps) {
  const { questions, answers } = loaderData;

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
