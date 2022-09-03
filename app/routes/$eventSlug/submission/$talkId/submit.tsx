import { useState } from 'react';
import { Form, useLoaderData } from '@remix-run/react';
import { Button } from '~/design-system/Buttons';
import { Checkbox } from '~/design-system/forms/Checkboxes';
import { ExternalLink } from '../../../../design-system/Links';
import { H1, Text } from '../../../../design-system/Typography';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { sessionRequired } from '../../../../services/auth/auth.server';
import { getEvent } from '../../../../services/events/event.server';
import type { ProposalInfo } from '../../../../services/events/submit.server';
import { getProposalInfo, submitProposal, validateSubmission } from '../../../../services/events/submit.server';
import { mapErrorToResponse } from '../../../../services/errors';
import { TextArea } from '../../../../design-system/forms/TextArea';

type SubmitForm = ProposalInfo & { codeOfConductUrl: string | null };

export const handle = { step: 'submission' };

export const loader: LoaderFunction = async ({ request, params }) => {
  const uid = await sessionRequired(request);
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
  const uid = await sessionRequired(request);
  const eventSlug = params.eventSlug!;
  const talkId = params.talkId!;
  const form = await request.formData();
  const data = validateSubmission(form);
  try {
    await submitProposal(talkId, eventSlug, uid, data);
    return redirect(`/${eventSlug}/proposals`);
  } catch (err) {
    mapErrorToResponse(err);
  }
};

export default function SubmissionSubmitRoute() {
  const data = useLoaderData<SubmitForm>();
  const [acceptedCod, setAcceptCod] = useState(!data.codeOfConductUrl);

  return (
    <Form method="post" className="py-6 sm:px-8 sm:py-10">
      <H1>{data.title}</H1>

      <div className="mt-2 -space-x-1 overflow-hidden">
        {data.speakers.map((speaker) => (
          <img
            key={speaker.name}
            className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
            src={speaker.photoURL || 'http://placekitten.com/100/100'}
            alt={speaker.name || 'Speaker'}
          />
        ))}
        <span className="test-gray-500 truncate pl-3 text-sm">by {data.speakers.map((s) => s.name).join(', ')}</span>
      </div>

      <div className="mt-8 space-y-4">
        {data.formats.length > 0 && (
          <Text variant="secondary">
            <b>Formats:</b> {data.formats.join(', ')}
          </Text>
        )}
        {data.categories.length > 0 && (
          <Text variant="secondary">
            <b>Categories:</b> {data.categories.join(', ')}
          </Text>
        )}
      </div>

      <TextArea id="message" name="message" label="Message to organizers" className="mt-8 " rows={4} />

      {data.codeOfConductUrl && (
        <Checkbox
          className="mt-8 font-medium"
          id="cod-agreement"
          name="cod-agreement"
          value="agree"
          onChange={() => setAcceptCod(!acceptedCod)}
        >
          Please agree with the{' '}
          <ExternalLink href={data.codeOfConductUrl} className="inline-flex">
            code of conduct
          </ExternalLink>{' '}
          of the event.
        </Checkbox>
      )}
      <div className="mt-6">
        <Button type="submit" disabled={!acceptedCod} className="w-full sm:w-auto">
          Submit proposal
        </Button>
      </div>
    </Form>
  );
}
