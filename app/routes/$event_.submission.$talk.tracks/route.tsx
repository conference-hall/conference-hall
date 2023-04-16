import invariant from 'tiny-invariant';
import type { ActionFunction, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { CategoriesForm } from '~/shared-components/proposals/forms/CategoriesForm';
import { saveTracks } from './server/save-tracks.server';
import { withZod } from '@remix-validated-form/with-zod';
import { useEvent } from '~/routes/$event/route';
import { getSubmittedProposal } from '~/shared-server/proposals/get-submitted-proposal.server';
import { sessionRequired } from '~/libs/auth/auth.server';
import { mapErrorToResponse } from '~/libs/errors';
import { TracksUpdateSchema } from './types/tracks';
import { FormatsForm } from '~/shared-components/proposals/forms/FormatsForm';
import { getEvent } from '~/shared-server/events/get-event.server';
import { Card } from '~/design-system/layouts/Card';
import { H2, H3 } from '~/design-system/Typography';

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
  const { event } = useEvent();
  const proposal = useLoaderData<typeof loader>();

  return (
    <>
      <H2>Proposal tracks</H2>

      <Card p={8}>
        <Form id="tracks-form" method="POST">
          <div className="space-y-12">
            {event.formats?.length > 0 && (
              <section>
                <H3>Formats</H3>
                <FormatsForm formats={event.formats} initialValues={proposal.formats} />
              </section>
            )}

            {event.categories?.length > 0 && (
              <section>
                <H3>Categories</H3>
                <CategoriesForm categories={event.categories} initialValues={proposal.categories} />
              </section>
            )}
          </div>
        </Form>
      </Card>
    </>
  );
}
