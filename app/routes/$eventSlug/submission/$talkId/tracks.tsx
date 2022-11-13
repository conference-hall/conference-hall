import type { ActionFunction, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { Button, ButtonLink } from '~/design-system/Buttons';
import { CategoriesForm } from '~/components/CategoriesForm';
import { sessionRequired } from '../../../../services/auth/auth.server';
import { fromErrors } from '../../../../services/errors';
import { getEvent } from '../../../../services/events/get-event.server';
import { useSubmissionStep } from '../../../../components/useSubmissionStep';
import { FormatsForm } from '../../../../components/FormatsForm';
import { fromSuccess, inputFromForm } from 'domain-functions';
import { getSubmissionTracks } from '~/services/events/submission/get-tracks.server';
import { useEvent } from '~/routes/$eventSlug';
import { saveSubmissionTracks } from '~/services/events/submission/save-tracks.server';

export const handle = { step: 'tracks' };

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  const { eventSlug, talkId } = params;
  const result = await getSubmissionTracks({ talkId, eventSlug, speakerId: uid });
  if (!result.success) throw fromErrors(result);
  return json(result.data);
};

export const action: ActionFunction = async ({ request, params }) => {
  const { uid } = await sessionRequired(request);
  const { eventSlug, talkId } = params;

  const data = await inputFromForm(request);
  const result = await saveSubmissionTracks({ talkId, eventSlug, speakerId: uid, data });
  if (!result.success) throw fromErrors(result);

  const event = await fromSuccess(getEvent)(eventSlug);
  if (event.surveyEnabled) {
    return redirect(`/${eventSlug}/submission/${talkId}/survey`);
  }
  return redirect(`/${eventSlug}/submission/${talkId}/submit`);
};

export default function SubmissionTracksRoute() {
  const event = useEvent();
  const tracks = useLoaderData<typeof loader>();
  const { previousPath } = useSubmissionStep();

  return (
    <Form method="post">
      <div className="space-y-12 py-6 sm:px-8 sm:py-10">
        {event.formats?.length > 0 ? <FormatsForm formats={event.formats} initialValues={tracks.formats} /> : null}

        {event.categories?.length > 0 ? (
          <CategoriesForm categories={event.categories} initialValues={tracks.categories} />
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
