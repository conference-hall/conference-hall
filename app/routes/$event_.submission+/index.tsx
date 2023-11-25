import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { ProgressBar } from '~/design-system/ProgressBar.tsx';
import { H2, Text } from '~/design-system/Typography.tsx';
import { Submissions } from '~/domains/submissions-management/Submissions.ts';
import { TalksLibrary } from '~/domains/talk-library/TalksLibrary.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { useEvent } from '~/routes/$event+/_layout.tsx';

import { MaxProposalsReached } from './__components/MaxProposalsReached.tsx';
import { NewProposal } from './__components/NewProposal.tsx';
import { SubmissionTalksList } from './__components/SubmissionTalksList.tsx';

export const handle = { step: 'selection' };

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const speakerId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const speakerProposals = Submissions.for(speakerId, params.event);
  const talkLibrary = TalksLibrary.of(speakerId);

  return json({
    proposalsCount: await speakerProposals.count(),
    drafts: await speakerProposals.drafts(),
    talks: await talkLibrary.listForEvent(params.event),
  });
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
            <Text size="xs" mb={1} weight="medium">
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
