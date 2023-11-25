import { parse } from '@conform-to/zod';
import type { ActionFunction, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useLoaderData, useNavigate } from '@remix-run/react';
import { useState } from 'react';
import invariant from 'tiny-invariant';

import { Avatar, AvatarGroup } from '~/design-system/Avatar.tsx';
import { Button } from '~/design-system/Buttons.tsx';
import { Checkbox } from '~/design-system/forms/Checkboxes.tsx';
import { TextArea } from '~/design-system/forms/TextArea.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { ExternalLink } from '~/design-system/Links.tsx';
import { H1, H2, Subtitle } from '~/design-system/Typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { redirectWithToast } from '~/libs/toasts/toast.server.ts';
import { getSubmittedProposal } from '~/routes/__server/proposals/get-submitted-proposal.server.ts';
import { ProposalSubmissionSchema } from '~/routes/__types/proposal.ts';
import { useEvent } from '~/routes/$event+/_layout.tsx';

import { submitProposal } from './__server/submit-proposal.server.ts';

export const handle = { step: 'submission' };

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  const proposal = await getSubmittedProposal(params.talk, params.event, userId);
  return json(proposal);
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireSession(request);
  const form = await request.formData();
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  const result = parse(form, { schema: ProposalSubmissionSchema });
  if (result.value) await submitProposal(params.talk, params.event, userId, result.value);

  return redirectWithToast(`/${params.event}/proposals`, 'success', 'Congratulation! Proposal submitted!');
};

export default function SubmissionSubmitRoute() {
  const navigate = useNavigate();
  const { event } = useEvent();
  const data = useLoaderData<typeof loader>();
  const [acceptedCod, setAcceptCod] = useState(!event.codeOfConductUrl);

  return (
    <Card>
      <Card.Title>
        <div className="mb-8 flex items-center gap-4">
          <Avatar picture={event.logo} name={event.name} size="l" square />
          <div className="flex-shrink-0">
            <H1 size="2xl">{event.name}</H1>
            <Subtitle>{`by ${event.teamName}`}</Subtitle>
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
              Please agree with the <ExternalLink href={event.codeOfConductUrl}>code of conduct</ExternalLink> of the
              event.
            </Checkbox>
          )}
        </Form>
      </Card.Content>

      <Card.Actions>
        <Button onClick={() => navigate(-1)} variant="secondary">
          Go back
        </Button>
        <Button type="submit" form="submit-form" disabled={!acceptedCod}>
          Submit proposal
        </Button>
      </Card.Actions>
    </Card>
  );
}
