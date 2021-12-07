import { ActionFunction, redirect } from 'remix';
import { requireUserSession } from '../auth/auth.server';

export const saveSurvey: ActionFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const { eventSlug, talkId } = params;
  return redirect(`/${eventSlug}/submit/talk/${talkId}/submit`);
};
