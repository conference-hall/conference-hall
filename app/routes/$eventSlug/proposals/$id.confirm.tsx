import type { ActionArgs, ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { inputFromForm } from 'domain-functions';
import { sessionRequired } from '~/services/auth/auth.server';
import { fromErrors } from '~/services/errors';
import { sendParticipationAnswer } from '~/services/events/submission/send-participation-answer.server';

export const action: ActionFunction = async ({ request, params }: ActionArgs) => {
  const { uid } = await sessionRequired(request);
  const form = await inputFromForm(request);
  const result = await sendParticipationAnswer({ speakerId: uid, proposalId: params.id, ...form });

  if (!result.success) throw fromErrors(result);

  return json(null);
};
