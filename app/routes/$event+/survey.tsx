import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { CfpSurvey } from '~/.server/cfp-survey/CfpSurvey';
import { SpeakerAnswers } from '~/.server/cfp-survey/SpeakerAnswers';
import { SurveySchema } from '~/.server/cfp-survey/SpeakerAnswers.types';
import { Button } from '~/design-system/Buttons.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { Page } from '~/design-system/layouts/PageContent.tsx';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { parseWithZod } from '~/libs/zod-parser';
import { SurveyForm } from '~/routes/__components/proposals/forms/SurveyForm.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const questions = await CfpSurvey.of(params.event).questions();
  const answers = await SpeakerAnswers.for(userId, params.event).answers();
  return json({ questions, answers });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const form = await request.formData();
  const result = parseWithZod(form, SurveySchema);
  if (!result.success) return json(null);

  await SpeakerAnswers.for(userId, params.event).save(result.value);
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

      <Page>
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
      </Page>
    </>
  );
}
