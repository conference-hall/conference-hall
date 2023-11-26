import { parse } from '@conform-to/zod';
import { type ActionFunctionArgs, json, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, useActionData, useSearchParams } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Button, ButtonLink } from '~/design-system/Buttons.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { ProposalReview } from '~/domains/organizer-cfp-reviews/ProposalReview.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { redirectWithToast } from '~/libs/toasts/toast.server.ts';
import { DetailsForm } from '~/routes/__components/proposals/forms/DetailsForm.tsx';
import { ProposalUpdateSchema } from '~/routes/__types/proposal.ts';

import { useProposalEvent, useProposalReview } from './_layout.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireSession(request);
  return json(null);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.team, 'Invalid team slug');
  invariant(params.proposal, 'Invalid proposal id');

  const form = await request.formData();
  const result = parse(form, { schema: ProposalUpdateSchema });
  if (!result.value) return json(result.error);

  const review = ProposalReview.for(userId, params.team, params.event, params.proposal);
  await review.update(result.value);

  const url = new URL(request.url);
  return redirectWithToast(
    `/team/${params.team}/${params.event}/review/${params.proposal}${url.search}`,
    'success',
    'Proposal saved.',
  );
};

export default function OrganizerProposalEditRoute() {
  const { event } = useProposalEvent();
  const { proposal } = useProposalReview();
  const [searchParams] = useSearchParams();
  const errors = useActionData<typeof action>();

  return (
    <Card>
      <Card.Content>
        <Form id="edit-proposal-form" method="POST">
          <DetailsForm initialValues={proposal} formats={event.formats} categories={event.categories} errors={errors} />
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
