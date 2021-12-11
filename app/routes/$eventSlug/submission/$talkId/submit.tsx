import { Form, useLoaderData } from 'remix';
import { Button, ButtonLink } from '~/components/Buttons';
import { Checkbox } from '../../../../components/forms/Checkboxes';
import { Heading } from '../../../../components/Heading';
import { usePreviousStep } from '../../../../features/event-submission/hooks/usePreviousStep';
import { loadProposal, SubmitForm, submitProposal } from '../../../../features/event-submission/submit.server';

export const handle = { step: 'submission' };

export const loader = loadProposal

export const action = submitProposal

export default function EventSubmitTalkRoute() {
  const proposal = useLoaderData<SubmitForm>()
  const previousStepPath = usePreviousStep()

  return (
    <Form method="post">
      <div className="px-8 py-6 sm:px-8 lg:w-8/12">
        <Heading description="This information will be displayed publicly so be careful what you share.">
          Almost done!
        </Heading>
        <p className="mt-4">
          You are going to submit "{proposal.title}"
        </p>
        <p className="mt-4">
          Speakers: {proposal.speakers.map(s => s.name).join(', ')}
        </p>
        <p className="mt-4">
          Formats: {proposal.formats.join(', ')}
        </p>
        <p className="mt-4">
          Categories: {proposal.categories.join(', ')}
        </p>
      </div>
      <div className="px-4 py-3 bg-gray-50 flex items-center justify-between sm:px-6">
        <ButtonLink to={previousStepPath} variant="secondary">
          Back
        </ButtonLink>
        <div className="flex items-center">
          <Checkbox id="cod-agreement" name="cod-agreement" value="agree">
            Please agree with our code of conduct.
          </Checkbox>
          <Button type="submit" className="ml-8">
            Submit proposal
          </Button>
        </div>
      </div>
    </Form>
  );
}
