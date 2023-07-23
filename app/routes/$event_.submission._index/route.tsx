import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { ProgressBar } from '~/design-system/ProgressBar';
import { H2, Text } from '~/design-system/Typography';
import { requireSession } from '~/libs/auth/session';

import { useEvent } from '../$event+/_layout';
import { MaxProposalsReached } from './components/MaxProposalsReached';
import { NewProposal } from './components/NewProposal';
import { SubmissionTalksList } from './components/SubmissionTalksList';
import { listTalksToSubmit } from './server/list-talks-to-submit.server';

export const handle = { step: 'selection' };

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const results = await listTalksToSubmit(userId, params.event);
  return json(results);
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
        <H2>Select or create a proposal</H2>
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
          <H2>Draft proposals</H2>
          <SubmissionTalksList label="Draft proposals list" talks={drafts} />
        </section>
      )}

      {talks.length > 0 && (
        <section className="space-y-4">
          <H2>From your talks library</H2>
          <SubmissionTalksList label="Talks list" talks={talks} />
        </section>
      )}
    </>
  );
}
