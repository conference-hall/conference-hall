import invariant from 'tiny-invariant';
import { useState } from 'react';
import { Form, useLoaderData } from '@remix-run/react';
import { json, redirect } from '@remix-run/node';
import { createToast } from '~/libs/toasts/toasts';
import { Button, ButtonLink } from '~/design-system/Buttons';
import { Checkbox } from '~/design-system/forms/Checkboxes';
import { ExternalLink } from '../../design-system/Links';
import { H2, Text } from '../../design-system/Typography';
import type { ActionFunction, LoaderArgs } from '@remix-run/node';
import { sessionRequired } from '../../libs/auth/auth.server';
import { submitProposal } from './server/submit-proposal.server';
import { mapErrorToResponse } from '../../libs/errors';
import { TextArea } from '../../design-system/forms/TextArea';
import { AvatarGroup } from '~/design-system/Avatar';
import { withZod } from '@remix-validated-form/with-zod';
import { ProposalSubmissionSchema } from '~/schemas/proposal';
import { useEvent } from '~/routes/$event/route';
import { getSubmittedProposal } from '../../shared-server/proposals/get-submitted-proposal.server';
import { Card } from '~/design-system/layouts/Card';

export const handle = { step: 'submission' };

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  try {
    const proposal = await getSubmittedProposal(params.talk, params.event, uid);
    return json(proposal);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const { uid, session } = await sessionRequired(request);
  const form = await request.formData();
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  const result = await withZod(ProposalSubmissionSchema).validate(form);
  try {
    if (result?.data) await submitProposal(params.talk, params.event, uid, result?.data);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
  const toast = await createToast(session, 'Congratulation! Proposal submitted!');
  return redirect(`/${params.event}/proposals`, toast);
};

export default function SubmissionSubmitRoute() {
  const { event } = useEvent();
  const data = useLoaderData<typeof loader>();
  const [acceptedCod, setAcceptCod] = useState(!event.codeOfConductUrl);

  return (
    <>
      <H2>Finish your submission</H2>

      <Card p={8}>
        <Form method="POST">
          <div>
            <H2>{data.title}</H2>
            <AvatarGroup avatars={data.speakers} displayNames />
          </div>

          <div className="mt-8 space-y-4">
            {data.formats.length > 0 && (
              <Text variant="secondary">
                <b>Formats:</b> {data.formats.map((f) => f.name).join(', ')}
              </Text>
            )}
            {data.categories.length > 0 && (
              <Text variant="secondary">
                <b>Categories:</b> {data.categories.map((c) => c.name).join(', ')}
              </Text>
            )}
          </div>

          <TextArea name="message" label="Message to organizers" className="mt-8 " rows={4} />

          {event.codeOfConductUrl && (
            <Checkbox
              className="mt-8 font-medium"
              id="cod-agreement"
              name="cod-agreement"
              value="agree"
              onChange={() => setAcceptCod(!acceptedCod)}
            >
              Please agree with the{' '}
              <ExternalLink href={event.codeOfConductUrl} className="inline-flex">
                code of conduct
              </ExternalLink>{' '}
              of the event.
            </Checkbox>
          )}
          <div className="mt-6 space-x-4">
            <Button type="submit" disabled={!acceptedCod}>
              Submit proposal
            </Button>
            <ButtonLink to={`/${event.slug}`} variant="secondary">
              Cancel submission
            </ButtonLink>
          </div>
        </Form>
      </Card>
    </>
  );
}
