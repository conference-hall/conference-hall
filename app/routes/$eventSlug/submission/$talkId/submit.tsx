import { useState } from 'react';
import { Form, useLoaderData } from '@remix-run/react';
import { Button } from '~/components-ui/Buttons';
import { Checkbox } from '~/components-ui/forms/Checkboxes';
import { ExternalLink } from '../../../../components-ui/Links';
import { H1, Text } from '../../../../components-ui/Typography';
import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from '@remix-run/node';
import { requireUserSession } from '../../../../services/auth/auth.server';
import { getEvent } from '../../../../services/events/event.server';
import {
  getProposalInfo,
  ProposalInfo,
  submitProposal,
  validateSubmission,
} from '../../../../services/events/submit.server';
import { mapErrorToResponse } from '../../../../services/errors';
import { Input } from '../../../../components-ui/forms/Input';
import { TextArea } from '../../../../components-ui/forms/TextArea';

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
    <Form method="post">
      <div className="flex w-full flex-col items-center py-20">
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
          <span className="test-gray-500 truncate pl-3 text-sm">
            by {data.speakers.map((s) => s.name).join(', ')}
          </span>
        </div>

        <Text variant="secondary" className="mt-8">
          {data.formats.join(', ')}
        </Text>
        <Text variant="secondary" className="mt-4">
          {data.categories.join(', ')}
        </Text>

        <TextArea
          id="message"
          name="message"
          label="Message to organizers"
          className="mt-16 block w-1/3 "
          rows={4}
        />

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
          <Button type="submit" disabled={!acceptedCod}>
            Submit proposal
          </Button>
        </div>
      </div>
    </Form>
  );
}
