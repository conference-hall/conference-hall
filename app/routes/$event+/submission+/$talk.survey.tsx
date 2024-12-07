import { parseWithZod } from '@conform-to/zod';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { redirect, useActionData, useLoaderData } from 'react-router';
import invariant from 'tiny-invariant';
import { SpeakerSurvey } from '~/.server/event-survey/speaker-survey.ts';
import { Button, ButtonLink } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { SurveyForm } from '~/routes/__components/talks/talk-forms/survey-form.tsx';
import { useSubmissionNavigation } from './__components/submission-context.tsx';

export const handle = { step: 'survey' };

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
  invariant(params.talk, 'Invalid talk id');

  const survey = SpeakerSurvey.for(params.event);
  const schema = await survey.buildSurveySchema();

  const form = await request.formData();
  const result = parseWithZod(form, { schema });
  if (result.status !== 'success') return result.error;

  await SpeakerSurvey.for(params.event).saveSpeakerAnswer(userId, result.value);

  const redirectTo = String(form.get('redirectTo'));
  throw redirect(redirectTo);
};

export default function SubmissionSurveyRoute() {
  const { questions, answers } = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();
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
