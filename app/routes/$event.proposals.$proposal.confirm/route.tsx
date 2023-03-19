import invariant from 'tiny-invariant';
import type { ActionArgs, ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { ProposalParticipationSchema } from '~/schemas/proposal';
import { sessionRequired } from '~/libs/auth/auth.server';
import { mapErrorToResponse } from '~/libs/errors';
import { createToast } from '~/utils/toasts';
import { sendParticipationAnswer } from './server/send-participation-answer.server';

export const action: ActionFunction = async ({ request, params }: ActionArgs) => {
  const { uid, session } = await sessionRequired(request);
  const form = await request.formData();
  invariant(params.proposal, 'Invalid proposal id');

  try {
    const result = await withZod(ProposalParticipationSchema).validate(form);
    if (result.error) return json(result.error.fieldErrors);
    await sendParticipationAnswer(uid, params.proposal, result.data.participation);
    return json(null, await createToast(session, 'Your response has been sent to organizers.'));
  } catch (err) {
    mapErrorToResponse(err);
  }
};
