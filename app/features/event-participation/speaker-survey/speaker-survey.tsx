import { parseWithZod } from '@conform-to/zod/v4';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import { i18n } from '~/shared/i18n/i18n.server.ts';
import { toast } from '~/shared/toasts/toast.server.ts';
import { SurveyForm } from '../../speaker/talk-library/components/talk-forms/survey-form.tsx';
import type { Route } from './+types/speaker-survey.ts';
import { SpeakerSurvey } from './services/speaker-survey.server.ts';

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
