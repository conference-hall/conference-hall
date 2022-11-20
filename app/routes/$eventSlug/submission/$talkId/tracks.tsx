import type { ActionFunction, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { Button, ButtonLink } from '~/design-system/Buttons';
import { CategoriesForm } from '~/components/CategoriesForm';
import { sessionRequired } from '../../../../services/auth/auth.server';
import { mapErrorToResponse } from '../../../../services/errors';
import { getEvent } from '../../../../services/events/get-event.server';
import { getProposalTracks, saveTracks } from '../../../../services/events/tracks.server';
import { useSubmissionStep } from '../../../../components/useSubmissionStep';
import { FormatsForm } from '../../../../components/FormatsForm';
import { withZod } from '@remix-validated-form/with-zod';
import { TracksUpdateSchema } from '~/schemas/tracks';

export const handle = { step: 'tracks' };

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  const eventSlug = params.eventSlug!;
  const talkId = params.talkId!;
  try {
    const event = await getEvent(eventSlug);
    const proposalTracks = await getProposalTracks(talkId, event.id, uid);

    return json({
      event: { formats: event.formats, categories: event.categories },
      proposal: proposalTracks,
    });
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const { uid } = await sessionRequired(request);
  const eventSlug = params.eventSlug!;
  const talkId = params.talkId!;
  const form = await request.formData();

  const result = await withZod(TracksUpdateSchema).validate(form);
  if (result.error) return result.error?.fieldErrors;

  try {
    const event = await getEvent(eventSlug);
    await saveTracks(talkId, event.id, uid, result.data);
    if (event.surveyEnabled) {
      return redirect(`/${eventSlug}/submission/${talkId}/survey`);
    }
    return redirect(`/${eventSlug}/submission/${talkId}/submit`);
  } catch (err) {
    mapErrorToResponse(err);
  }
};

export default function SubmissionTracksRoute() {
  const { event, proposal } = useLoaderData<typeof loader>();
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
