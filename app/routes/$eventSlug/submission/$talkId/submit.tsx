import { useState } from 'react';
import { Form, useLoaderData } from 'remix';
import { Button } from '~/components/Buttons';
import { Checkbox } from '~/components/forms/Checkboxes';
import { loadProposal, SubmitForm, submitProposal } from '~/features/event-submission/step-submit.server';
import { ExternalLink } from '../../../../components/Links';

export const handle = { step: 'submission' };

export const loader = loadProposal;

export const action = submitProposal;

export default function EventSubmitTalkRoute() {
  const data = useLoaderData<SubmitForm>();
  const [acceptCod, setAcceptCod] = useState(!data.codeOfConductUrl);

  return (
    <Form method="post">
      <div className="flex flex-col items-center py-20">
        <p className="text-3xl leading-6 font-medium text-gray-900">{data.title}</p>
        <ul role="list" className="mt-6 divide-y divide-gray-200 sm:col-span-2">
          {data.speakers.map((speaker) => (
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
        <p className="mt-4 text-sm text-gray-500">{data.formats.join(', ')}</p>
        <p className="mt-4 text-sm text-gray-500">{data.categories.join(', ')}</p>
        {data.codeOfConductUrl && (
          <Checkbox
            className="mt-16"
            id="cod-agreement"
            name="cod-agreement"
            value="agree"
            onChange={() => setAcceptCod(!acceptCod)}
          >
            Please agree with the{' '}
            <ExternalLink href={data.codeOfConductUrl} className="inline-flex">
              code of conduct
            </ExternalLink>{' '}
            of the event.
          </Checkbox>
        )}
        <div className="mt-6">
          <Button type="submit" disabled={!acceptCod}>
            Submit proposal
          </Button>
        </div>
      </div>
    </Form>
  );
}
