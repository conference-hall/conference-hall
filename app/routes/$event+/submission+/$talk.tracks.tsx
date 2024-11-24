import { parseWithZod } from '@conform-to/zod';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';
import { TalkSubmission } from '~/.server/cfp-submission-funnel/talk-submission.ts';
import { getTracksSchema } from '~/.server/cfp-submission-funnel/talk-submission.types.ts';
import { EventPage } from '~/.server/event-page/event-page.ts';
import { Button, ButtonLink } from '~/design-system/buttons.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { CategoriesForm } from '~/routes/__components/talks/talk-forms/categories-form.tsx';
import { FormatsForm } from '~/routes/__components/talks/talk-forms/formats-form.tsx';

import { useCurrentEvent } from '~/routes/__components/contexts/event-page-context.tsx';
import { useCurrentStep } from './__components/submission-context.tsx';

export const handle = { step: 'tracks' };

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  const proposal = await TalkSubmission.for(userId, params.event).get(params.talk);
  return { formats: proposal.formats.map(({ id }) => id), categories: proposal.categories.map(({ id }) => id) };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  const form = await request.formData();
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  const { formatsRequired, categoriesRequired } = await EventPage.of(params.event).get();

  const result = parseWithZod(form, { schema: getTracksSchema(formatsRequired, categoriesRequired) });
  if (result.status !== 'success') return result.error;

  const submission = TalkSubmission.for(userId, params.event);
  await submission.saveTracks(params.talk, result.value);

  const redirectTo = form.get('redirectTo')?.toString() ?? '';
  return redirect(redirectTo);
};

export default function SubmissionTracksRoute() {
  const currentEvent = useCurrentEvent();
  const proposal = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();
  const currentStep = useCurrentStep();

  return (
    <Page>
      <Card>
        <Card.Title>
          <H2>Proposal tracks</H2>
        </Card.Title>
        <Card.Content>
          <Form id="tracks-form" method="POST">
            <div className="space-y-12">
              {currentEvent.formats?.length > 0 && (
                <section>
                  <FormatsForm
                    formatsAllowMultiple={currentEvent.formatsAllowMultiple}
                    formats={currentEvent.formats}
                    required={currentEvent.formatsRequired}
                    initialValues={proposal.formats}
                  />
                  {errors?.formats && (
                    <Callout title="You must select at least one proposal format." variant="error" className="mt-4" />
                  )}
                </section>
              )}

              {currentEvent.categories?.length > 0 && (
                <section>
                  <CategoriesForm
                    categoriesAllowMultiple={currentEvent.categoriesAllowMultiple}
                    categories={currentEvent.categories}
                    required={currentEvent.categoriesRequired}
                    initialValues={proposal.categories}
                  />
                  {errors?.categories && (
                    <Callout title="You must select at least one proposal category." variant="error" className="mt-4" />
                  )}
                </section>
              )}
            </div>
          </Form>
        </Card.Content>
        <Card.Actions>
          {currentStep?.previousPath ? (
            <ButtonLink to={currentStep?.previousPath} variant="secondary">
              Go back
            </ButtonLink>
          ) : null}
          <Button
            type="submit"
            form="tracks-form"
            name="redirectTo"
            value={currentStep?.nextPath ?? ''}
            iconRight={ArrowRightIcon}
          >
            Continue
          </Button>
        </Card.Actions>
      </Card>
    </Page>
  );
}
