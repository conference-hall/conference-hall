import invariant from 'tiny-invariant';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { CategoriesForm } from '~/components/proposals/forms/CategoriesForm';
import { getTracksSchema, saveTracks } from './server/save-tracks.server';
import { useEvent } from '~/routes/$event/route';
import { getSubmittedProposal } from '~/server/proposals/get-submitted-proposal.server';
import { requireSession } from '~/libs/auth/session';
import { FormatsForm } from '~/components/proposals/forms/FormatsForm';
import { getEvent } from '~/server/events/get-event.server';
import { Card } from '~/design-system/layouts/Card';
import { H2 } from '~/design-system/Typography';
import { useSubmissionStep } from '../$event_.submission/components/useSubmissionStep';
import { Button, ButtonLink } from '~/design-system/Buttons';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { AlertError } from '~/design-system/Alerts';
import { parse } from '@conform-to/zod';

export const handle = { step: 'tracks' };

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  const proposal = await getSubmittedProposal(params.talk, params.event, userId);
  return json({ formats: proposal.formats.map(({ id }) => id), categories: proposal.categories.map(({ id }) => id) });
};

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await requireSession(request);
  const form = await request.formData();
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  const { id, surveyEnabled, formatsRequired, categoriesRequired } = await getEvent(params.event);

  const result = parse(form, { schema: getTracksSchema(formatsRequired, categoriesRequired) });
  if (!result.value) return json(result.error);

  await saveTracks(params.talk, id, userId, result.value);

  if (surveyEnabled) return redirect(`/${params.event}/submission/${params.talk}/survey`);

  return redirect(`/${params.event}/submission/${params.talk}/submit`);
};

export default function SubmissionTracksRoute() {
  const { event } = useEvent();
  const proposal = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();
  const { previousPath } = useSubmissionStep();

  return (
    <Card>
      <Card.Title>
        <H2 size="base">Proposal tracks</H2>
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
                  required={event.formatsRequired}
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
        <ButtonLink to={previousPath} variant="secondary">
          Go back
        </ButtonLink>
        <Button type="submit" form="tracks-form" iconRight={ArrowRightIcon}>
          Continue
        </Button>
      </Card.Actions>
    </Card>
  );
}
