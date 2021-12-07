import { Form, useActionData, useLoaderData } from 'remix';
import { Button, ButtonLink } from '~/components/Buttons';
import { TalkForm } from '../../../features/event-submission/components/TalkForm';
import { usePreviousStep } from '../../../features/event-submission/hooks/usePreviousStep';
import { loadTalk, TalkFormData } from '../../../features/event-submission/load-talk-form.server';
import { saveProposal } from '../../../features/event-submission/save-proposal.server';
import { ValidationErrors } from '../../../features/event-submission/validation/errors';

export const handle = { step: 'proposal' };

export const loader = loadTalk;

export const action = saveProposal;

export default function EventSubmitTalkRoute() {
  const data = useLoaderData<TalkFormData>();
  const errors = useActionData<ValidationErrors>();
  const previousStepPath = usePreviousStep()

  return (
    <Form method="post">
      <TalkForm {...data} errors={errors?.fieldErrors} />

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
