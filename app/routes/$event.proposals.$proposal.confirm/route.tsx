import invariant from 'tiny-invariant';
import type { ActionArgs, ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { ProposalParticipationSchema } from '~/schemas/proposal';
import { requireSession } from '~/libs/auth/session';
import { addToast } from '~/libs/toasts/toasts';
import { sendParticipationAnswer } from './server/send-participation-answer.server';

export const action: ActionFunction = async ({ request, params }: ActionArgs) => {
  const userId = await requireSession(request);
  const form = await request.formData();
  invariant(params.proposal, 'Invalid proposal id');

  const result = await withZod(ProposalParticipationSchema).validate(form);
  if (result.error) return json(result.error.fieldErrors);

  await sendParticipationAnswer(userId, params.proposal, result.data.participation);

  return json(null, await addToast(request, 'Your response has been sent to organizers.'));
};
