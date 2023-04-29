import invariant from 'tiny-invariant';
import { useState } from 'react';
import { Form, useLoaderData } from '@remix-run/react';
import { json, redirect } from '@remix-run/node';
import { createToast } from '~/libs/toasts/toasts';
import { Button, ButtonLink } from '~/design-system/Buttons';
import { Checkbox } from '~/design-system/forms/Checkboxes';
import type { ActionFunction, LoaderArgs } from '@remix-run/node';
import { submitProposal } from './server/submit-proposal.server';
import { Avatar, AvatarGroup } from '~/design-system/Avatar';
import { withZod } from '@remix-validated-form/with-zod';
import { ProposalSubmissionSchema } from '~/schemas/proposal';
import { useEvent } from '~/routes/$event/route';
import { Card } from '~/design-system/layouts/Card';
import { requireSession } from '~/libs/auth/session';
import { getSubmittedProposal } from '~/shared-server/proposals/get-submitted-proposal.server';
import { mapErrorToResponse } from '~/libs/errors';
import { H1, H2, Subtitle } from '~/design-system/Typography';
import { TextArea } from '~/design-system/forms/TextArea';
import { ExternalLink } from '~/design-system/Links';
import { useSubmissionStep } from '../$event_.submission/hooks/useSubmissionStep';

export const handle = { step: 'submission' };

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  try {
    const proposal = await getSubmittedProposal(params.talk, params.event, userId);
    return json(proposal);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireSession(request);
  const form = await request.formData();
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  const result = await withZod(ProposalSubmissionSchema).validate(form);
  try {
    if (result?.data) await submitProposal(params.talk, params.event, userId, result?.data);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
  const toast = await createToast(request, 'Congratulation! Proposal submitted!');
  return redirect(`/${params.event}/proposals`, toast);
};

export default function SubmissionSubmitRoute() {
  const { event } = useEvent();
  const data = useLoaderData<typeof loader>();
  const { previousPath } = useSubmissionStep();
  const [acceptedCod, setAcceptCod] = useState(!event.codeOfConductUrl);

  return (
    <Card>
      <Card.Title>
        <div className="mb-8 flex items-center gap-4">
          <Avatar photoURL={event.bannerUrl} name={event.name} size="l" square />
          <div className="flex-shrink-0">
            <H1 size="2xl">{event.name}</H1>
            <Subtitle heading>{`by ${event.organizationName}`}</Subtitle>
          </div>
        </div>
      </Card.Title>

      <div className="border-b border-gray-200" />

      <Card.Content>
        <Form method="POST" id="submit-form" className="space-y-8">
          <div>
            <H2 size="l">{data.title}</H2>
            <AvatarGroup avatars={data.speakers} displayNames />
          </div>

          {data.formats.length > 0 && (
            <Subtitle>
              <b>Formats:</b> {data.formats.map((f) => f.name).join(', ')}
            </Subtitle>
          )}

          {data.categories.length > 0 && (
            <Subtitle>
              <b>Categories:</b> {data.categories.map((c) => c.name).join(', ')}
            </Subtitle>
          )}

          <TextArea name="message" label="Message to organizers" rows={4} />

          {event.codeOfConductUrl && (
            <Checkbox id="cod-agreement" name="cod-agreement" value="agree" onChange={() => setAcceptCod(!acceptedCod)}>
              Please agree with the{' '}
              <ExternalLink href={event.codeOfConductUrl} className="inline-flex">
                code of conduct
              </ExternalLink>{' '}
              of the event.
            </Checkbox>
          )}
        </Form>
      </Card.Content>

      <Card.Actions>
        <ButtonLink to={previousPath} variant="secondary">
          Go back
        </ButtonLink>
        <Button type="submit" form="submit-form" disabled={!acceptedCod}>
          Submit proposal
        </Button>
      </Card.Actions>
    </Card>
  );
}
