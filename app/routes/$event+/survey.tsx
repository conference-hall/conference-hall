import { parse } from '@conform-to/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Button } from '~/design-system/Buttons.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { PageContent } from '~/design-system/layouts/PageContent.tsx';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle.tsx';
import { EventSurvey } from '~/domains/event-survey/EventSurvey';
import { SpeakerAnswers } from '~/domains/event-survey/SpeakerAnswers';
import { SurveySchema } from '~/domains/event-survey/SpeakerAnswers.types';
import { requireSession } from '~/libs/auth/session.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { SurveyForm } from '~/routes/__components/proposals/forms/SurveyForm.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const questions = await EventSurvey.of(params.event).questions();
  const answers = await SpeakerAnswers.for(params.event, userId).answers();
  return json({ questions, answers });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const form = await request.formData();
  const result = parse(form, { schema: SurveySchema });
  if (!result.value) return json(null);

  await SpeakerAnswers.for(params.event, userId).save(result.value);
  return toast('success', 'Survey saved.');
};

export default function EventSurveyRoute() {
  const { questions, answers } = useLoaderData<typeof loader>();

  return (
    <>
      <PageHeaderTitle
        title="We have some questions for you."
        subtitle="This information are asked by the organizers to give you a better speaker experience."
      />

      <PageContent>
        <Card>
          <Card.Content>
            <Form id="survey-form" method="POST">
              <SurveyForm questions={questions} initialValues={answers} />
            </Form>
          </Card.Content>
          <Card.Actions>
            <Button type="submit" form="survey-form">
              Save survey
            </Button>
          </Card.Actions>
        </Card>
      </PageContent>
    </>
  );
}
