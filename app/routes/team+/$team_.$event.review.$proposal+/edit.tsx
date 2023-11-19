import { parse } from '@conform-to/zod';
import { type ActionFunctionArgs, json, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, useActionData, useLoaderData, useSearchParams } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Button, ButtonLink } from '~/design-system/Buttons.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { redirectWithToast } from '~/libs/toasts/toast.server.ts';
import { DetailsForm } from '~/routes/__components/proposals/forms/DetailsForm.tsx';
import { getEvent } from '~/routes/__server/events/get-event.server.ts';
import { ProposalUpdateSchema } from '~/routes/__types/proposal.ts';

import { updateProposal } from '../$team.$event+/__server/update-proposal.server.ts';
import { useProposalReview } from './_layout.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  const event = await getEvent(params.event);
  return json(event);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.proposal, 'Invalid proposal id');
  const form = await request.formData();

  const result = parse(form, { schema: ProposalUpdateSchema });
  if (!result.value) return json(result.error);

  await updateProposal(params.event, params.proposal, userId, result.value);

  const url = new URL(request.url);
  return redirectWithToast(
    `/team/${params.team}/${params.event}/review/${params.proposal}${url.search}`,
    'success',
    'Proposal saved.',
  );
};

export default function OrganizerProposalEditRoute() {
  const { proposalReview } = useProposalReview();
  const [searchParams] = useSearchParams();
  const event = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();

  return (
    <Card>
      <Card.Content>
        <Form id="edit-proposal-form" method="POST">
          <DetailsForm
            initialValues={proposalReview.proposal}
            formats={event.formats}
            categories={event.categories}
            errors={errors}
          />
        </Form>
      </Card.Content>
      <Card.Actions>
        <ButtonLink to={{ pathname: '..', search: searchParams.toString() }} variant="secondary">
          Cancel
        </ButtonLink>
        <Button type="submit" form="edit-proposal-form">
          Save proposal
        </Button>
      </Card.Actions>
    </Card>
  );
}
