import { Form, useLoaderData } from 'remix';
import { Button, ButtonLink } from '~/components/Buttons';
import { CategoriesForm } from '~/features/event-submission/components/CategoriesForm';
import { FormatsForm } from '~/features/event-submission/components/FormatsForm';
import { usePreviousStep } from '~/features/event-submission/hooks/usePreviousStep';
import { loadTracks, saveTracks, TracksData } from '~/features/event-submission/tracks.server';

export const handle = { step: 'tracks' };

export const loader = loadTracks;

export const action = saveTracks;

export default function SubmissionTracksRoute() {
  const data = useLoaderData<TracksData>();
  const previousStepPath = usePreviousStep();

  return (
    <Form method="post">
      {data.formats?.length > 0 ? (
        <div className="px-8 py-3 sm:px-8 lg:w-8/12">
          <FormatsForm formats={data.formats} initialValues={data.initialValues.formats} />
        </div>
      ) : null}

      {data.categories?.length > 0 ? (
        <div className="px-8 py-3 sm:px-8 lg:w-8/12">
          <CategoriesForm categories={data.categories} initialValues={data.initialValues.categories} />
        </div>
      ) : null}

      <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
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
