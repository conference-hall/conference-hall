import { redirect, type ActionArgs, type LoaderArgs, json } from '@remix-run/node';
import { useProposalReview } from '../team_.$team.$event.review.$proposal/route';
import { requireSession } from '~/libs/auth/session';
import invariant from 'tiny-invariant';
import { ProposalUpdateSchema } from '~/schemas/proposal';
import { Form, useActionData, useLoaderData, useSearchParams } from '@remix-run/react';
import { DetailsForm } from '~/components/proposals/forms/DetailsForm';
import { Button, ButtonLink } from '~/design-system/Buttons';
import { Card } from '~/design-system/layouts/Card';
import { getEvent } from '~/server/events/get-event.server';
import { addToast } from '~/libs/toasts/toasts';
import { updateProposal } from '../team.$team.$event._index/server/update-proposal.server';
import { parse } from '@conform-to/zod';

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  const event = await getEvent(params.event);
  return json(event);
};

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.proposal, 'Invalid proposal id');
  const form = await request.formData();

  const result = parse(form, { schema: ProposalUpdateSchema });
  if (!result.value) return json(result.error);

  await updateProposal(params.event, params.proposal, userId, result.value);

  const url = new URL(request.url);
  throw redirect(
    `/team/${params.team}/${params.event}/review/${params.proposal}${url.search}`,
    await addToast(request, 'Proposal saved.')
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
