import { Form, useLoaderData } from '@remix-run/react';
import { Button, ButtonLink } from '~/components/Buttons';
import { CategoriesForm } from '~/components/proposal/CategoriesForm';
import { FormatsForm } from '~/components/proposal/FormatsForm';
import { loadTracks, saveTracks, TracksData } from '~/features/events-submission/step-tracks.server';
import { usePreviousStep } from '../hooks/usePreviousStep';

export const handle = { step: 'tracks' };

export const loader = loadTracks;

export const action = saveTracks;

export default function SubmissionTracksRoute() {
  const data = useLoaderData<TracksData>();
  const previousStepPath = usePreviousStep();

  return (
    <Form method="post">
      <div className="px-8 py-6 sm:py-10 space-y-12">
        {data.formats?.length > 0 ? (
          <FormatsForm formats={data.formats} initialValues={data.initialValues.formats} />
        ) : null}

        {data.categories?.length > 0 ? (
          <CategoriesForm categories={data.categories} initialValues={data.initialValues.categories} />
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
