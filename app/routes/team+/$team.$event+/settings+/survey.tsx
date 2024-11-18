import { parseWithZod } from '@conform-to/zod';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';
import { EventSurveySettings } from '~/.server/event-survey/event-survey-settings';
import {
  LegacyEventSurveySettingsSchema,
  SurveyMoveQuestionSchema,
  SurveyQuestionSchema,
  SurveyRemoveQuestionSchema,
} from '~/.server/event-survey/types.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { LegacySurveySettingsForm } from './__components/survey/legacy-survey-settings-form.tsx';
import { SurveySettingsForm } from './__components/survey/survey-settings-form.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  const surveySettings = EventSurveySettings.for(userId, params.team, params.event);
  const config = await surveySettings.getConfig();
  return config;
};

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');
  const surveySettings = EventSurveySettings.for(userId, params.team, params.event);

  const form = await request.formData();
  const intent = form.get('intent');

  switch (intent) {
    case 'toggle-legacy-survey': {
      const enabled = await surveySettings.toggleLegacySurvey();
      return toast('success', `Speaker survey ${enabled ? 'enabled' : 'disabled'}`);
    }
    case 'update-legacy-questions': {
      const result = parseWithZod(form, { schema: LegacyEventSurveySettingsSchema });
      if (result.status !== 'success') return null;
      await surveySettings.updateLegacyQuestions(result.value);
      return toast('success', 'Survey questions saved.');
    }
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

export default function EventSurveySettingsRoute() {
  const config = useLoaderData<typeof loader>();

  if (config.legacy) {
    return <LegacySurveySettingsForm config={config} />;
  }
  return <SurveySettingsForm config={config} />;
}
