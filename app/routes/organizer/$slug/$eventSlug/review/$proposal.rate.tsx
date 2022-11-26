import type { ActionArgs } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { ProposalRatingDataSchema } from '~/schemas/proposal';
import { sessionRequired } from '~/services/auth/auth.server';
import { mapErrorToResponse } from '~/services/errors';
import { rateProposal } from '~/services/organizer-review/rate-proposal.server';

export const action = async ({ request, params }: ActionArgs) => {
  const { uid } = await sessionRequired(request);
  try {
    const form = await request.formData();
    const result = await withZod(ProposalRatingDataSchema).validate(form);
    if (result.data) {
      await rateProposal(params.slug!, params.eventSlug!, params.proposal!, uid, result.data);
    }
    return null;
  } catch (e) {
    throw mapErrorToResponse(e);
  }
};
