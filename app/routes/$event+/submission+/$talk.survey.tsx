import { parseWithZod } from '@conform-to/zod';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { redirect } from 'react-router';
import { SpeakerSurvey } from '~/.server/event-survey/speaker-survey.ts';
import { Button, ButtonLink } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { requireUserSession } from '~/libs/auth/session.ts';
import { SurveyForm } from '~/routes/components/talks/talk-forms/survey-form.tsx';
import type { Route } from './+types/$talk.survey.ts';
import { useSubmissionNavigation } from './components/submission-context.tsx';

export const handle = { step: 'survey' };

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const survey = SpeakerSurvey.for(params.event);
  const questions = await survey.getQuestions();
  const answers = await survey.getSpeakerAnswers(userId);
  return { questions, answers };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);
  const survey = SpeakerSurvey.for(params.event);
  const schema = await survey.buildSurveySchema();
  const form = await request.formData();
  const result = parseWithZod(form, { schema });
  if (result.status !== 'success') return result.error;

  await SpeakerSurvey.for(params.event).saveSpeakerAnswer(userId, result.value);

  return redirect(String(form.get('redirectTo')));
};

export default function SubmissionSurveyRoute({ loaderData, actionData: errors }: Route.ComponentProps) {
  const { questions, answers } = loaderData;
  const { previousPath, nextPath } = useSubmissionNavigation();

  return (
    <Page>
      <Card>
        <Card.Title>
          <H2>We have some questions for you</H2>
        </Card.Title>

        <Card.Content>
          <SurveyForm id="survey-form" questions={questions} initialValues={answers} errors={errors} />
        </Card.Content>

        <Card.Actions>
          <ButtonLink to={previousPath} variant="secondary">
            Go back
          </ButtonLink>
          <Button type="submit" form="survey-form" name="redirectTo" value={nextPath} iconRight={ArrowRightIcon}>
            Continue
          </Button>
        </Card.Actions>
      </Card>
    </Page>
  );
}
