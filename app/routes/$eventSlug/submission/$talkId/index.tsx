import { Form, useActionData, useLoaderData } from 'remix';
import { Button } from '~/components/Buttons';
import { loadProposal, ProposalData, saveProposal } from '~/features/event-submission/step-proposal.server';
import { ValidationErrors } from '~/utils/validation-errors';
import { TalkAbstractForm } from '~/components/proposal/TalkAbstractForm';
import { H2, Text } from '../../../../components/Typography';

export const handle = { step: 'proposal' };

export const loader = loadProposal;

export const action = saveProposal;

export default function SubmissionProposalRoute() {
  const talk = useLoaderData<ProposalData>();
  const errors = useActionData<ValidationErrors>();

  return (
    <Form method="post">
      <div className="px-8 py-6 sm:py-10">
        <div className="mb-6">
          <H2>Your proposal</H2>
          <Text variant="secondary" className="mt-1">This information will be displayed publicly so be careful what you share.</Text>
        </div>
        <TalkAbstractForm initialValues={talk} errors={errors?.fieldErrors} />
      </div>

      <div className="px-4 py-5 text-right sm:px-6">
        <Button type="submit">
          Save as draft and continue
        </Button>
      </div>
    </Form>
  );
}
