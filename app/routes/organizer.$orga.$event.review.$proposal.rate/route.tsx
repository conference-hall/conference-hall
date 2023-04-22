import invariant from 'tiny-invariant';
import type { ActionArgs } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { ProposalRatingDataSchema } from '~/schemas/proposal';
import { requireSession } from '~/libs/auth/cookies';
import { mapErrorToResponse } from '~/libs/errors';
import { rateProposal } from '~/routes/organizer.$orga.$event.review.$proposal.rate/server/rate-proposal.server';

export const action = async ({ request, params }: ActionArgs) => {
  const { uid } = await requireSession(request);
  invariant(params.orga, 'Invalid organization slug');
  invariant(params.event, 'Invalid event slug');
  invariant(params.proposal, 'Invalid proposal id');

  try {
    const form = await request.formData();
    const result = await withZod(ProposalRatingDataSchema).validate(form);
    if (result.data) {
      await rateProposal(params.orga, params.event, params.proposal, uid, result.data);
    }
    return null;
  } catch (e) {
    throw mapErrorToResponse(e);
  }
};
