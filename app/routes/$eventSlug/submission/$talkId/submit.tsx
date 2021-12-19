import { Form, useLoaderData } from 'remix';
import { Button, ButtonLink } from '~/components/Buttons';
import { Checkbox } from '~/components/forms/Checkboxes';
import { Heading } from '~/components/Heading';
import { usePreviousStep } from '~/features/event-submission/hooks/usePreviousStep';
import { loadProposal, SubmitForm, submitProposal } from '~/features/event-submission/step-submit.server';

export const handle = { step: 'submission' };

export const loader = loadProposal;

export const action = submitProposal;

export default function EventSubmitTalkRoute() {
  const proposal = useLoaderData<SubmitForm>();
  const previousStepPath = usePreviousStep();

  return (
    <Form method="post">
      <div className="flex flex-col items-center py-20">
        <p className="text-3xl leading-6 font-medium text-gray-900">{proposal.title}</p>
        <ul role="list" className="mt-6 divide-y divide-gray-200 sm:col-span-2">
          {proposal.speakers.map((speaker) => (
            <li key={speaker.name} className="flex items-center">
              <img
                className="h-10 w-10 rounded-full"
                src={speaker.photoURL || 'http://placekitten.com/100/100'}
                alt={speaker.name || 'Speaker'}
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{speaker.name}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-gray-500">{proposal.formats.join(', ')}</p>
        <p className="mt-4 text-sm text-gray-500">{proposal.categories.join(', ')}</p>
        <Checkbox className="mt-16" id="cod-agreement" name="cod-agreement" value="agree">
          Please agree with the code of conduct of the event.
        </Checkbox>
        <div className="mt-6">
          <Button type="submit">Submit proposal</Button>
        </div>
      </div>
    </Form>
  );
}
