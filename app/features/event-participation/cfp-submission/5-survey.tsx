import { parseWithZod } from '@conform-to/zod/v4';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { redirect } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { SpeakerSurvey } from '~/features/event-participation/speaker-survey/services/speaker-survey.server.ts';
import { SurveyForm } from '~/features/speaker/talk-library/components/talk-forms/survey-form.tsx';
import { getProtectedSession } from '~/shared/auth/auth.middleware.ts';
import type { Route } from './+types/5-survey.ts';
import { useSubmissionNavigation } from './components/submission-context.tsx';

export const handle = { step: 'survey' };

export const loader = async ({ params, context }: Route.LoaderArgs) => {
  const { userId } = getProtectedSession(context);
  const survey = SpeakerSurvey.for(params.event);
  const questions = await survey.getQuestions();
  const answers = await survey.getSpeakerAnswers(userId);
  return { questions, answers };
};

export const action = async ({ request, params, context }: Route.ActionArgs) => {
  const { userId } = getProtectedSession(context);
  const survey = SpeakerSurvey.for(params.event);
  const schema = await survey.buildSurveySchema();
  const form = await request.formData();
  const result = parseWithZod(form, { schema });
  if (result.status !== 'success') return result.error;

  await SpeakerSurvey.for(params.event).saveSpeakerAnswer(userId, result.value);
  return redirect(String(form.get('redirectTo')));
};

export default function SubmissionSurveyRoute({ loaderData, actionData: errors }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { questions, answers } = loaderData;
  const formId = useId();
  const { previousPath, nextPath } = useSubmissionNavigation();

  return (
    <Page>
      <Card>
        <Card.Title>
          <H2>{t('event.submission.survey.heading')}</H2>
        </Card.Title>

        <Card.Content>
          <SurveyForm id={formId} questions={questions} initialValues={answers} errors={errors} />
        </Card.Content>

        <Card.Actions>
          <Button to={previousPath} variant="secondary">
            {t('common.go-back')}
          </Button>
          <Button type="submit" form={formId} name="redirectTo" value={nextPath} iconRight={ArrowRightIcon}>
            {t('common.continue')}
          </Button>
        </Card.Actions>
      </Card>
    </Page>
  );
}
