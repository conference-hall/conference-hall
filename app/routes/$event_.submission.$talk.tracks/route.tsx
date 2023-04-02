import invariant from 'tiny-invariant';
import type { ActionFunction, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { Button, ButtonLink } from '~/design-system/Buttons';
import { CategoriesForm } from '~/shared-components/proposal-forms/CategoriesForm';
import { saveTracks } from './server/save-tracks.server';
import { withZod } from '@remix-validated-form/with-zod';
import { useEvent } from '~/routes/$event/route';
import { getSubmittedProposal } from '~/shared-server/proposals/get-submitted-proposal.server';
import { sessionRequired } from '~/libs/auth/auth.server';
import { mapErrorToResponse } from '~/libs/errors';
import { TracksUpdateSchema } from './types/tracks';
import { useSubmissionStep } from '~/shared-components/useSubmissionStep';
import { FormatsForm } from '~/shared-components/proposal-forms/FormatsForm';
import { getEvent } from '~/shared-server/events/get-event.server';
import { Card } from '~/design-system/Card';
import { H2, Subtitle } from '~/design-system/Typography';

export const handle = { step: 'tracks' };

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  try {
    const proposal = await getSubmittedProposal(params.talk, params.event, uid);
    return json({ formats: proposal.formats.map(({ id }) => id), categories: proposal.categories.map(({ id }) => id) });
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const { uid } = await sessionRequired(request);
  const form = await request.formData();
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  const result = await withZod(TracksUpdateSchema).validate(form);
  if (result.error) return result.error?.fieldErrors;

  try {
    const event = await getEvent(params.event);
    await saveTracks(params.talk, event.id, uid, result.data);
    if (event.surveyEnabled) {
      return redirect(`/${params.event}/submission/${params.talk}/survey`);
    }
    return redirect(`/${params.event}/submission/${params.talk}/submit`);
  } catch (err) {
    mapErrorToResponse(err);
  }
};

export default function SubmissionTracksRoute() {
  const event = useEvent();
  const proposal = useLoaderData<typeof loader>();
  const { previousPath } = useSubmissionStep();

  return (
    <>
      <div>
        <H2 mb={0}>Proposal tracks</H2>
        <Subtitle>
          Give more information about you, these information will be visible by organizers when you submit a talk.
        </Subtitle>
      </div>
      <Card p={8} rounded="xl">
        <Form method="POST">
          <div className="space-y-12">
            {event.formats?.length > 0 ? (
              <FormatsForm formats={event.formats} initialValues={proposal.formats} />
            ) : null}

            {event.categories?.length > 0 ? (
              <CategoriesForm categories={event.categories} initialValues={proposal.categories} />
            ) : null}
          </div>

          <div className="flex justify-between gap-4 sm:flex-row sm:justify-end">
            <ButtonLink to={previousPath} variant="secondary">
              Back
            </ButtonLink>
            <Button type="submit">Next</Button>
          </div>
        </Form>
      </Card>
    </>
  );
}
