import { useState } from 'react';
import { Form, useLoaderData } from 'remix';
import { Button } from '~/components/Buttons';
import { Checkbox } from '~/components/forms/Checkboxes';
import { loadProposal, SubmitForm, submitProposal } from '~/features/event-submission/step-submit.server';
import { ExternalLink } from '../../../../components/Links';
import { H1, Text } from '../../../../components/Typography';

export const handle = { step: 'submission' };

export const loader = loadProposal;

export const action = submitProposal;

export default function SubmissionSubmitRoute() {
  const data = useLoaderData<SubmitForm>();
  const [acceptCod, setAcceptCod] = useState(!data.codeOfConductUrl);

  return (
    <Form method="post">
      <div className="flex flex-col items-center py-20">
        <H1>{data.title}</H1>

        <div className="mt-2 flex items-center overflow-hidden -space-x-1">
          {data.speakers.map((speaker) => (
            <img
              key={speaker.name}
              className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
              src={speaker.photoURL || 'http://placekitten.com/100/100'}
              alt={speaker.name || 'Speaker'}
            />
          ))}
          <span className="pl-3 text-sm test-gray-500 truncate">
            by {data.speakers.map((s) => s.name).join(', ')}
          </span>
        </div>

        <Text variant="secondary" className="mt-8">
          {data.formats.join(', ')}
        </Text>
        <Text variant="secondary" className="mt-4">
          {data.categories.join(', ')}
        </Text>
        {data.codeOfConductUrl && (
          <Checkbox
            className="mt-16 font-medium"
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
