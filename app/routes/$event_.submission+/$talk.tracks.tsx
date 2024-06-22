import { ArrowRightIcon } from '@heroicons/react/20/solid';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData, useNavigate } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { SubmissionSteps } from '~/.server/cfp-submission-funnel/submission-steps.ts';
import { TalkSubmission } from '~/.server/cfp-submission-funnel/talk-submission.ts';
import { getTracksSchema } from '~/.server/cfp-submission-funnel/talk-submission.types.ts';
import { EventPage } from '~/.server/event-page/event-page.ts';
import { AlertError } from '~/design-system/alerts.tsx';
import { Button } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { parseWithZod } from '~/libs/zod-parser.ts';

import { CategoriesForm } from '../__components/talks/talk-forms/categories-form.tsx';
import { FormatsForm } from '../__components/talks/talk-forms/formats-form.tsx';
import { useEvent } from '../$event+/__components/use-event.tsx';

export const handle = { step: 'tracks' };

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  const proposal = await TalkSubmission.for(userId, params.event).get(params.talk);
  return json({ formats: proposal.formats.map(({ id }) => id), categories: proposal.categories.map(({ id }) => id) });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  const form = await request.formData();
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  const { formatsRequired, categoriesRequired } = await EventPage.of(params.event).get();

  const result = parseWithZod(form, getTracksSchema(formatsRequired, categoriesRequired));
  if (!result.success) return json(result.error);

  const submission = TalkSubmission.for(userId, params.event);
  await submission.saveTracks(params.talk, result.value);

  const nextStep = await SubmissionSteps.nextStepFor('tracks', params.event, params.talk);
  return redirect(nextStep.path);
};

export default function SubmissionTracksRoute() {
  const navigate = useNavigate();
  const { event } = useEvent();
  const proposal = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();

  return (
    <Card>
      <Card.Title>
        <H2>Proposal tracks</H2>
      </Card.Title>
      <Card.Content>
        <Form id="tracks-form" method="POST">
          <div className="space-y-12">
            {event.formats?.length > 0 && (
              <section>
                <FormatsForm
                  formats={event.formats}
                  required={event.formatsRequired}
                  initialValues={proposal.formats}
                />
                {errors?.formats && (
                  <AlertError className="mt-4">You must select at least one proposal format.</AlertError>
                )}
              </section>
            )}

            {event.categories?.length > 0 && (
              <section>
                <CategoriesForm
                  categories={event.categories}
                  required={event.categoriesRequired}
                  initialValues={proposal.categories}
                />
                {errors?.categories && (
                  <AlertError className="mt-4">You must select at least one proposal category.</AlertError>
                )}
              </section>
            )}
          </div>
        </Form>
      </Card.Content>
      <Card.Actions>
        <Button onClick={() => navigate(-1)} variant="secondary">
          Go back
        </Button>
        <Button type="submit" form="tracks-form" iconRight={ArrowRightIcon}>
          Continue
        </Button>
      </Card.Actions>
    </Card>
  );
}
