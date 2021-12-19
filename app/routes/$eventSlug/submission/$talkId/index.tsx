import { Form, useActionData, useLoaderData } from 'remix';
import { Button } from '~/components/Buttons';
import { loadProposal, ProposalData, saveProposal } from '~/features/event-submission/step-proposal.server';
import { ValidationErrors } from '~/utils/validation-errors';
import { Heading } from '~/components/Heading';
import { ProposalForm } from '~/components/proposal/ProposalForm';

export const handle = { step: 'proposal' };

export const loader = loadProposal;

export const action = saveProposal;

export default function EventSubmitTalkRoute() {
  const talk = useLoaderData<ProposalData>();
  const errors = useActionData<ValidationErrors>();

  return (
    <Form method="post">
      <div className="px-8 py-6 sm:py-10">
        <Heading
          description="This information will be displayed publicly so be careful what you share."
          className="mb-6"
        >
          Your proposal
        </Heading>
        <ProposalForm initialValues={talk} errors={errors?.fieldErrors} />
      </div>

      <div className="px-4 py-5 border-t border-gray-200 text-right sm:px-6">
        <Button type="submit" className="ml-4">
          Save as draft and continue
        </Button>
      </div>
    </Form>
  );
}
