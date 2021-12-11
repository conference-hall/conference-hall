import { Form, useActionData, useLoaderData } from 'remix';
import { Button, ButtonLink } from '~/components/Buttons';
import { TalkForm } from '~/features/event-submission/components/TalkForm';
import { usePreviousStep } from '~/features/event-submission/hooks/usePreviousStep';
import { loadProposal, ProposalData, saveProposal } from '~/features/event-submission/proposal.server';
import { ValidationErrors } from '~/features/event-submission/validation/errors';

export const handle = { step: 'proposal' };

export const loader = loadProposal;

export const action = saveProposal;

export default function EventSubmitTalkRoute() {
  const talk = useLoaderData<ProposalData>();
  const errors = useActionData<ValidationErrors>();

  return (
    <Form method="post">
      <TalkForm initialValues={talk} errors={errors?.fieldErrors} />

      <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
        <Button type="submit" className="ml-4">
          Next
        </Button>
      </div>
    </Form>
  );
}
