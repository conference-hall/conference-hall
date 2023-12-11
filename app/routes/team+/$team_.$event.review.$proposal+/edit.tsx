import { parse } from '@conform-to/zod';
import { type ActionFunctionArgs, json, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, useActionData, useNavigate } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Button } from '~/design-system/Buttons.tsx';
import SlideOver from '~/design-system/SlideOver.tsx';
import { ProposalReview } from '~/domains/proposal-reviews/ProposalReview.ts';
import { ProposalUpdateSchema } from '~/domains/proposal-reviews/ProposalReview.types.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { redirectWithToast } from '~/libs/toasts/toast.server.ts';
import { DetailsForm } from '~/routes/__components/proposals/forms/DetailsForm.tsx';

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

export default function ProposalEditRoute() {
  const { event } = useProposalEvent();
  const { proposal } = useProposalReview();
  const navigate = useNavigate();
  const errors = useActionData<typeof action>();

  const onClose = () => navigate(-1);

  return (
    <SlideOver open onClose={onClose} size="l">
      <SlideOver.Content title="Edit proposal" onClose={onClose}>
        <Form id="edit-proposal-form" method="POST">
          <DetailsForm initialValues={proposal} formats={event.formats} categories={event.categories} errors={errors} />
        </Form>
      </SlideOver.Content>
      <SlideOver.Actions>
        <Button onClick={onClose} variant="secondary">
          Cancel
        </Button>
        <Button type="submit" form="edit-proposal-form">
          Save proposal
        </Button>
      </SlideOver.Actions>
    </SlideOver>
  );
}
