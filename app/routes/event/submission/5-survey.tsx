import { parseWithZod } from '@conform-to/zod';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { redirect } from 'react-router';
import { SpeakerSurvey } from '~/.server/event-survey/speaker-survey.ts';
import { Button, ButtonLink } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { requireUserSession } from '~/libs/auth/session.ts';
import { SurveyForm } from '~/routes/components/talks/talk-forms/survey-form.tsx';
import { useSubmissionNavigation } from '../components/submission-page/submission-context.tsx';
import type { Route } from './+types/5-survey.ts';

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
          <ButtonLink to={previousPath} variant="secondary">
            {t('common.go-back')}
          </ButtonLink>
          <Button type="submit" form={formId} name="redirectTo" value={nextPath} iconRight={ArrowRightIcon}>
            {t('common.continue')}
          </Button>
        </Card.Actions>
      </Card>
    </Page>
  );
}
