import invariant from 'tiny-invariant';
import type { ActionFunction, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { Button, ButtonLink } from '~/design-system/Buttons';
import { CategoriesForm } from '~/components/CategoriesForm';
import { sessionRequired } from '../libs/auth/auth.server';
import { mapErrorToResponse } from '../libs/errors';
import { getEvent } from '../services/event-page/get-event.server';
import { saveTracks } from '../services/event-submission/save-tracks.server';
import { useSubmissionStep } from '../components/useSubmissionStep';
import { FormatsForm } from '../components/FormatsForm';
import { withZod } from '@remix-validated-form/with-zod';
import { TracksUpdateSchema } from '~/schemas/tracks';
import { getSubmittedProposal } from '~/services/event-submission/get-submitted-proposal.server';
import { useEvent } from '~/routes/$event';

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
    <Form method="post">
      <div className="space-y-12 py-6 sm:px-8 sm:py-10">
        {event.formats?.length > 0 ? <FormatsForm formats={event.formats} initialValues={proposal.formats} /> : null}

        {event.categories?.length > 0 ? (
          <CategoriesForm categories={event.categories} initialValues={proposal.categories} />
        ) : null}
      </div>

      <div className="my-4 flex justify-between gap-4 sm:flex-row sm:justify-end sm:px-8 sm:pb-4">
        <ButtonLink to={previousPath} variant="secondary">
          Back
        </ButtonLink>
        <Button type="submit">Next</Button>
      </div>
    </Form>
  );
}
