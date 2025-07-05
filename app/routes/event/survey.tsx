import { parseWithZod } from '@conform-to/zod';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { SpeakerSurvey } from '~/.server/event-survey/speaker-survey.ts';
import { i18n } from '~/libs/i18n/i18n.server.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { requireUserSession } from '~/shared/auth/session.ts';
import { Button } from '~/shared/design-system/buttons.tsx';
import { Card } from '~/shared/design-system/layouts/card.tsx';
import { Page } from '~/shared/design-system/layouts/page.tsx';
import { SurveyForm } from '../components/talks/talk-forms/survey-form.tsx';
import type { Route } from './+types/survey.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const survey = SpeakerSurvey.for(params.event);
  const questions = await survey.getQuestions();
  const answers = await survey.getSpeakerAnswers(userId);

  return { questions, answers };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const t = await i18n.getFixedT(request);
  const { userId } = await requireUserSession(request);
  const survey = SpeakerSurvey.for(params.event);
  const schema = await survey.buildSurveySchema();
  const form = await request.formData();
  const result = parseWithZod(form, { schema });

  if (result.status !== 'success') return result.error;
  await survey.saveSpeakerAnswer(userId, result.value);

  return toast('success', t('event.survey.feedback.saved'));
};

export default function EventSurveyRoute({ loaderData, actionData: errors }: Route.ComponentProps) {
  const { t } = useTranslation();
  const formId = useId();
  const { questions, answers } = loaderData;

  return (
    <Page>
      <Page.Heading title={t('event.survey.heading')} subtitle={t('event.survey.description')} />

      <Card>
        <Card.Content>
          <SurveyForm id={formId} questions={questions} initialValues={answers} errors={errors} />
        </Card.Content>
        <Card.Actions>
          <Button type="submit" form={formId}>
            {t('event.survey.form.submit')}
          </Button>
        </Card.Actions>
      </Card>
    </Page>
  );
}
