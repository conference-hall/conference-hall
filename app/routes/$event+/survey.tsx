import { parseWithZod } from '@conform-to/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { CfpSurvey } from '~/.server/cfp-survey/cfp-survey.ts';
import { SpeakerAnswers } from '~/.server/cfp-survey/speaker-answers.ts';
import { SurveySchema } from '~/.server/cfp-survey/speaker-answers.types.ts';
import { Button } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { toast } from '~/libs/toasts/toast.server.ts';

import { SurveyForm } from '../__components/talks/talk-forms/survey-form.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const questions = await CfpSurvey.of(params.event).questions();
  const answers = await SpeakerAnswers.for(userId, params.event).getAnswers();
  return json({ questions, answers });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const form = await request.formData();
  const result = parseWithZod(form, { schema: SurveySchema });
  if (result.status !== 'success') return json(null);

  await SpeakerAnswers.for(userId, params.event).save(result.value);
  return toast('success', 'Survey saved.');
};

export default function EventSurveyRoute() {
  const { questions, answers } = useLoaderData<typeof loader>();

  return (
    <Page>
      <Page.Heading
        title="We have some questions for you."
        subtitle="This information are asked by the organizers to give you a better speaker experience."
      />

      <Card>
        <Card.Content>
          <SurveyForm id="survey-form" questions={questions} initialValues={answers} />
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
