import type { ActionArgs, ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { ProposalParticipationSchema } from '~/schemas/proposal';
import { sessionRequired } from '~/services/auth/auth.server';
import { mapErrorToResponse } from '~/services/errors';
import { sendProposalParticipation } from '~/services/events/proposals.server';
import { createToast } from '~/utils/toasts';

export const action: ActionFunction = async ({ request, params }: ActionArgs) => {
  const { uid, session } = await sessionRequired(request);
  const proposalId = params.id!;
  const form = await request.formData();
  try {
    const result = await withZod(ProposalParticipationSchema).validate(form);
    if (result.error) return json(result.error.fieldErrors);
    await sendProposalParticipation(uid, proposalId, result.data.participation);
    return json(null, await createToast(session, 'Your response has been sent to organizers.'));
  } catch (err) {
    mapErrorToResponse(err);
  }
};
