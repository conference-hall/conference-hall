import { useState } from 'react';
import { Form, useLoaderData } from '@remix-run/react';
import { Button } from '~/components/Buttons';
import { Checkbox } from '~/components/forms/Checkboxes';
import { ExternalLink } from '../../../../components/Links';
import { H1, Text } from '../../../../components/Typography';
import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node';
import { requireUserSession } from '../../../../services/auth/auth.server';
import { getEvent } from '../../../../services/events/event.server';
import { getProposalInfo, ProposalInfo, submitProposal } from '../../../../services/events/submit.server';
import { mapErrorToResponse } from '../../../../services/errors';

type SubmitForm = ProposalInfo & { codeOfConductUrl: string | null };

export const handle = { step: 'submission' };

export const loader: LoaderFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const eventSlug = params.eventSlug!;
  const talkId = params.talkId!;
  try {
    const event = await getEvent(eventSlug);
    const proposal = await getProposalInfo(talkId, event.id, uid);
    return json<SubmitForm>({
      ...proposal,
      codeOfConductUrl: event.codeOfConductUrl,
    });
  } catch (err) {
    mapErrorToResponse(err);
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const eventSlug = params.eventSlug!;
  const talkId = params.talkId!;
  try {
    await submitProposal(talkId, eventSlug, uid);
    return redirect(`/${eventSlug}/proposals`);
  } catch (err) {
    mapErrorToResponse(err);
  }
};

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
