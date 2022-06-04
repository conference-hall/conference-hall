import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { Button, ButtonLink } from '~/components/Buttons';
import { CategoriesForm } from '~/components/proposal/CategoriesForm';
import { FormatsForm } from '~/components/proposal/FormatsForm';
import { requireUserSession } from '../../../../services/auth/auth.server';
import { EventTracks, getEvent } from '../../../../services/events/event.server';
import { getProposalTracks, ProposalTracks, saveTracks, validateTracksForm } from '../../../../services/events/tracks.server';
import { usePreviousStep } from '../../components/usePreviousStep';

type Tracks = {
  event: { formats: EventTracks, categories: EventTracks };
  proposal: ProposalTracks
}

export const handle = { step: 'tracks' };

export const loader: LoaderFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const eventSlug = params.eventSlug!;
  const talkId = params.talkId!;
  try {
    const event = await getEvent(eventSlug);
    const proposalTracks = await getProposalTracks(talkId, event.id, uid)

    return json<Tracks>({
      event: { formats: event.formats, categories: event.categories },
      proposal: proposalTracks,
    });
  } catch (error) {
    throw new Response('Event not found.', { status: 404 });
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
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
  } catch (error) {
    throw new Response('Event not found.', { status: 404 });
  }
};

export default function SubmissionTracksRoute() {
  const { event, proposal } = useLoaderData<Tracks>();
  const previousStepPath = usePreviousStep();

  return (
    <Form method="post">
      <div className="px-8 py-6 sm:py-10 space-y-12">
        {event.formats?.length > 0 ? (
          <FormatsForm formats={event.formats} initialValues={proposal.formats} />
        ) : null}

        {event.categories?.length > 0 ? (
          <CategoriesForm categories={event.categories} initialValues={proposal.categories} />
        ) : null}
      </div>

      <div className="px-4 py-5 text-right sm:px-6">
        <ButtonLink to={previousStepPath} variant="secondary">
          Back
        </ButtonLink>
        <Button type="submit" className="ml-4">
          Next
        </Button>
      </div>
    </Form>
  );
}
