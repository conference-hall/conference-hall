import { parseWithZod } from '@conform-to/zod';
import { requireUserSession } from '~/shared/auth/session.ts';
import { i18n } from '~/shared/i18n/i18n.server.ts';
import { toast } from '~/shared/toasts/toast.server.ts';
import type { Route } from './+types/survey.ts';
import { SurveySettingsForm } from './components/survey-settings-form.tsx';
import { SurveyQuestionSchema } from './models/survey-config.ts';
import {
  EventSurveySettings,
  SurveyMoveQuestionSchema,
  SurveyRemoveQuestionSchema,
} from './services/event-survey-settings.server.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const surveySettings = EventSurveySettings.for(userId, params.team, params.event);
  return surveySettings.getConfig();
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const t = await i18n.getFixedT(request);
  const { userId } = await requireUserSession(request);
  const surveySettings = EventSurveySettings.for(userId, params.team, params.event);
  const form = await request.formData();
  const intent = form.get('intent');

  switch (intent) {
    case 'toggle-survey': {
      const enabled = await surveySettings.toggleSurvey();
      return toast(
        'success',
        enabled
          ? t('event-management.settings.survey.feedbacks.enabled')
          : t('event-management.settings.survey.feedbacks.disabled'),
      );
    }
    case 'remove-question': {
      const result = parseWithZod(form, { schema: SurveyRemoveQuestionSchema });
      if (result.status !== 'success') return toast('error', t('error.global'));
      await surveySettings.removeQuestion(result.value.id);
      return toast('success', t('event-management.settings.survey.feedbacks.question-removed'));
    }
    case 'add-question': {
      const result = parseWithZod(form, { schema: SurveyQuestionSchema });
      if (result.status !== 'success') return toast('error', result.error?.options?.join(', ') || t('error.global'));
      await surveySettings.addQuestion(result.value);
      return toast('success', t('event-management.settings.survey.feedbacks.question-added'));
    }
    case 'update-question': {
      const result = parseWithZod(form, { schema: SurveyQuestionSchema });
      if (result.status !== 'success') return toast('error', t('error.global'));
      await surveySettings.updateQuestion(result.value);
      return toast('success', t('event-management.settings.survey.feedbacks.question-updated'));
    }
    case 'move-question': {
      const result = parseWithZod(form, { schema: SurveyMoveQuestionSchema });
      if (result.status !== 'success') return toast('error', t('error.global'));
      await surveySettings.moveQuestion(result.value);
      return null;
    }
  }
  return null;
};

export default function EventSurveySettingsRoute({ loaderData: config }: Route.ComponentProps) {
  return <SurveySettingsForm config={config} />;
}
