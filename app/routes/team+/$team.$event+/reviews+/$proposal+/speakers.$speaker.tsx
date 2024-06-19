import { json, type LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { ProposalReview } from '~/.server/reviews/ProposalReview';
import { requireSession } from '~/libs/auth/session.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');
  invariant(params.proposal, 'Invalid proposal slug');
  invariant(params.speaker, 'Invalid speaker slug');

  const review = ProposalReview.for(userId, params.team, params.event, params.proposal);
  const speaker = await review.getSpeakerInfo(params.speaker);

  return json(speaker);
};

export default function ProposalSpeakerRoute() {
  return null;
}
