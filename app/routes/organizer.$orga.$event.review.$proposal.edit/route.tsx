import invariant from 'tiny-invariant';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useProposalReview } from '../organizer.$orga.$event.review.$proposal/route';
import { requireSession } from '~/libs/auth/cookies';
import { Form, useActionData, useSearchParams } from '@remix-run/react';
import { DetailsForm } from '~/shared-components/proposals/forms/DetailsForm';
import { Button, ButtonLink } from '~/design-system/Buttons';
import { mapErrorToResponse } from '~/libs/errors';
import { withZod } from '@remix-validated-form/with-zod';
import { ProposalUpdateSchema } from '~/schemas/proposal';
import { updateProposal } from '~/routes/organizer.$orga.$event._index/server/update-proposal.server';
import { useOrganizerEvent } from '../organizer.$orga.$event/route';

export const loader = async ({ request }: LoaderArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: ActionArgs) => {
  const { uid } = await requireSession(request);
  const form = await request.formData();
  invariant(params.orga, 'Invalid organization slug');
  invariant(params.event, 'Invalid event slug');
  invariant(params.proposal, 'Invalid proposal id');

  try {
    const result = await withZod(ProposalUpdateSchema).validate(form);
    if (result.error) return json(result.error.fieldErrors);
    await updateProposal(params.orga, params.event, params.proposal, uid, result.data);
    const url = new URL(request.url);
    throw redirect(`/organizer/${params.orga}/${params.event}/review/${params.proposal}${url.search}`);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export default function OrganizerProposalContentRoute() {
  const { event } = useOrganizerEvent();
  const { proposalReview } = useProposalReview();
  const [searchParams] = useSearchParams();
  const errors = useActionData<typeof action>();

  return (
    <Form method="POST" className="flex h-full flex-1 flex-col justify-between overflow-hidden">
      <div className="flex flex-col gap-8 overflow-auto py-8 sm:px-8">
        <DetailsForm
          initialValues={proposalReview.proposal}
          errors={errors}
          formats={event.formats}
          categories={event.categories}
        />
      </div>

      <div className="flex justify-end gap-2 border-t border-gray-200 bg-white p-6">
        <ButtonLink to={{ pathname: '..', search: searchParams.toString() }} variant="secondary">
          Cancel
        </ButtonLink>
        <Button type="submit">Save proposal</Button>
      </div>
    </Form>
  );
}
