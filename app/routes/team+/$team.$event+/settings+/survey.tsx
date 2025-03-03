import { parseWithZod } from '@conform-to/zod';
import { EventSurveySettings } from '~/.server/event-survey/event-survey-settings.ts';
import {
  SurveyMoveQuestionSchema,
  SurveyQuestionSchema,
  SurveyRemoveQuestionSchema,
} from '~/.server/event-survey/types.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import type { Route } from './+types/survey.ts';
import { SurveySettingsForm } from './components/survey/survey-settings-form.tsx';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const userId = await requireSession(request);
  const surveySettings = EventSurveySettings.for(userId, params.team, params.event);
  return surveySettings.getConfig();
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const userId = await requireSession(request);
  const surveySettings = EventSurveySettings.for(userId, params.team, params.event);
  const form = await request.formData();
  const intent = form.get('intent');

  switch (intent) {
    case 'toggle-survey': {
      const enabled = await surveySettings.toggleSurvey();
      return toast('success', `Speaker survey ${enabled ? 'enabled' : 'disabled'}`);
    }
    case 'remove-question': {
      const result = parseWithZod(form, { schema: SurveyRemoveQuestionSchema });
      if (result.status !== 'success') return toast('error', 'Something went wrong.');
      await surveySettings.removeQuestion(result.value.id);
      return toast('success', 'Question removed.');
    }
    case 'add-question': {
      const result = parseWithZod(form, { schema: SurveyQuestionSchema });
      if (result.status !== 'success')
        return toast('error', result.error?.options?.join(', ') || 'Something went wrong.');
      await surveySettings.addQuestion(result.value);
      return toast('success', 'Question added.');
    }
    case 'update-question': {
      const result = parseWithZod(form, { schema: SurveyQuestionSchema });
      if (result.status !== 'success') return toast('error', 'Something went wrong.');
      await surveySettings.updateQuestion(result.value);
      return toast('success', 'Question updated.');
    }
    case 'move-question': {
      const result = parseWithZod(form, { schema: SurveyMoveQuestionSchema });
      if (result.status !== 'success') return toast('error', 'Something went wrong.');
      await surveySettings.moveQuestion(result.value);
      return null;
    }
  }
  return null;
};

export default function EventSurveySettingsRoute({ loaderData: config }: Route.ComponentProps) {
  return <SurveySettingsForm config={config} />;
}
