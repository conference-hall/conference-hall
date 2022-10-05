import { useState } from 'react';
import { Form, useLoaderData } from '@remix-run/react';
import { Button } from '~/design-system/Buttons';
import { Checkbox } from '~/design-system/forms/Checkboxes';
import { ExternalLink } from '../../../../design-system/Links';
import { H1, Text } from '../../../../design-system/Typography';
import type { ActionFunction, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { sessionRequired } from '../../../../services/auth/auth.server';
import { getEvent } from '../../../../services/events/event.server';
import { getProposalInfo, submitProposal } from '../../../../services/events/submit.server';
import { mapErrorToResponse } from '../../../../services/errors';
import { TextArea } from '../../../../design-system/forms/TextArea';
import { AvatarGroup } from '~/design-system/Avatar';
import { withZod } from '@remix-validated-form/with-zod';
import { ProposalSubmissionSchema } from '~/schemas/proposal';

export const handle = { step: 'submission' };

export const loader = async ({ request, params }: LoaderArgs) => {
  const uid = await sessionRequired(request);
  const eventSlug = params.eventSlug!;
  const talkId = params.talkId!;
  try {
    const event = await getEvent(eventSlug);
    const proposal = await getProposalInfo(talkId, event.id, uid);
    return json({ ...proposal, codeOfConductUrl: event.codeOfConductUrl });
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const uid = await sessionRequired(request);
  const eventSlug = params.eventSlug!;
  const talkId = params.talkId!;
  const form = await request.formData();
  const result = await withZod(ProposalSubmissionSchema).validate(form);
  try {
    if (result?.data) await submitProposal(talkId, eventSlug, uid, result?.data);
    return redirect(`/${eventSlug}/proposals`);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export default function SubmissionSubmitRoute() {
  const data = useLoaderData<typeof loader>();
  const [acceptedCod, setAcceptCod] = useState(!data.codeOfConductUrl);

  return (
    <Form method="post" className="py-6 sm:px-8 sm:py-10">
      <H1>{data.title}</H1>

      <AvatarGroup avatars={data.speakers} displayNames className="mt-2" />

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

      <TextArea name="message" label="Message to organizers" className="mt-8 " rows={4} />

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
    </Form>
  );
}
