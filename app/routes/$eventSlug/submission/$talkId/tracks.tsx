import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { Button, ButtonLink } from '~/design-system/Buttons';
import { CategoriesForm } from '~/components/CategoriesForm';
import { sessionRequired } from '../../../../services/auth/auth.server';
import { mapErrorToResponse } from '../../../../services/errors';
import type { EventTracks } from '../../../../services/events/event.server';
import { getEvent } from '../../../../services/events/event.server';
import type { ProposalTracks } from '../../../../services/events/tracks.server';
import { getProposalTracks, saveTracks, validateTracksForm } from '../../../../services/events/tracks.server';
import { useSubmissionStep } from '../../../../components/useSubmissionStep';
import { FormatsForm } from '../../../../components/FormatsForm';

type Tracks = {
  event: { formats: EventTracks; categories: EventTracks };
  proposal: ProposalTracks;
};

export const handle = { step: 'tracks' };

export const loader: LoaderFunction = async ({ request, params }) => {
  const uid = await sessionRequired(request);
  const eventSlug = params.eventSlug!;
  const talkId = params.talkId!;
  try {
    const event = await getEvent(eventSlug);
    const proposalTracks = await getProposalTracks(talkId, event.id, uid);

    return json<Tracks>({
      event: { formats: event.formats, categories: event.categories },
      proposal: proposalTracks,
    });
  } catch (err) {
    mapErrorToResponse(err);
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const uid = await sessionRequired(request);
  const eventSlug = params.eventSlug!;
  const talkId = params.talkId!;
  const form = await request.formData();
  const result = validateTracksForm(form);
  if (!result.success) return result.error.flatten();

  try {
    const event = await getEvent(eventSlug);
    await saveTracks(talkId, event.id, uid, result.data);
    if (event.hasSurvey) {
      return redirect(`/${eventSlug}/submission/${talkId}/survey`);
    }
    return redirect(`/${eventSlug}/submission/${talkId}/submit`);
  } catch (err) {
    mapErrorToResponse(err);
  }
};

export default function SubmissionTracksRoute() {
  const { event, proposal } = useLoaderData<Tracks>();
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
        <ButtonLink to={previousPath} variant="secondary" className="w-full sm:w-auto">
          Back
        </ButtonLink>
        <Button type="submit" className="w-full sm:w-auto">
          Next
        </Button>
      </div>
    </Form>
  );
}
