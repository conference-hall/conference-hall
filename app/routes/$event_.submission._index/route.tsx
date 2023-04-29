import invariant from 'tiny-invariant';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { requireSession } from '~/libs/auth/session';
import { mapErrorToResponse } from '~/libs/errors';
import { H2, H3, Text } from '~/design-system/Typography';
import { MaxProposalsReached } from './components/MaxProposalsReached';
import { SubmissionTalksList } from './components/SubmissionTalksList';
import { listTalksToSubmit } from './server/list-talks-to-submit.server';
import { ProgressBar } from '~/design-system/ProgressBar';
import { useEvent } from '../$event/route';
import { NewProposal } from './components/NewProposal';

export const handle = { step: 'selection' };

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  try {
    const results = await listTalksToSubmit(userId, params.event);
    return json(results);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export default function EventSubmitRoute() {
  const { event } = useEvent();
  const { proposalsCount, drafts, talks } = useLoaderData<typeof loader>();
  const { maxProposals } = event;

  if (maxProposals && proposalsCount >= maxProposals) {
    return <MaxProposalsReached maxProposals={maxProposals} />;
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <H2 size="l">Select or create a proposal</H2>
        {maxProposals && (
          <div>
            <Text size="xs" mb={1} strong>
              {proposalsCount} / {maxProposals} proposals submitted.
            </Text>
            <ProgressBar value={proposalsCount} max={maxProposals} />
          </div>
        )}
      </div>

      <NewProposal />

      {drafts.length > 0 && (
        <section className="space-y-4">
          <H3 size="base">Draft proposals</H3>
          <SubmissionTalksList label="Draft proposals list" talks={drafts} />
        </section>
      )}

      {talks.length > 0 && (
        <section className="space-y-4">
          <H3 size="base">From your talks library</H3>
          <SubmissionTalksList label="Talks list" talks={talks} />
        </section>
      )}
    </>
  );
}
