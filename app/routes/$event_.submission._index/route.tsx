import invariant from 'tiny-invariant';
import { SquaresPlusIcon } from '@heroicons/react/24/outline';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { requireSession } from '~/libs/auth/session';
import { mapErrorToResponse } from '~/libs/errors';
import { H2, H3, Text } from '~/design-system/Typography';
import { MaxProposalsReached } from './components/MaxProposalsReached';
import { SubmissionTalksList } from './components/SubmissionTalksList';
import { getProposalCountsForEvent, listTalksToSubmit } from './server/list-talks-to-submit.server';
import { ProgressBar } from '~/design-system/ProgressBar';

export const handle = { step: 'selection' };

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  try {
    const talks = await listTalksToSubmit(uid, params.event);
    const proposalsCount = await getProposalCountsForEvent(uid, params.event);
    return json({ talks, proposalsCount });
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export default function EventSubmitRoute() {
  const data = useLoaderData<typeof loader>();
  const { max, submitted } = data.proposalsCount;

  if (max && submitted >= max) {
    return <MaxProposalsReached maxProposals={max} />;
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <H2 size="l">Select or create a proposal</H2>
        {max && (
          <div>
            <Text size="xs" mb={1} strong>
              {submitted} / {max} proposals submitted.
            </Text>
            <ProgressBar value={submitted} max={max} />
          </div>
        )}
      </div>

      <NewProposal />

      <section>
        <H3 size="base" mb={4}>
          Draft proposals
        </H3>
        <SubmissionTalksList talks={data?.talks} />
      </section>

      <section>
        <H3 size="base" mb={4}>
          From your talks library
        </H3>
        <SubmissionTalksList talks={data?.talks} />
      </section>
    </>
  );
}

function NewProposal() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <Link
        to="new"
        className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-400 p-3 hover:border-gray-500 hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <SquaresPlusIcon className="mx-auto h-8 w-8 text-gray-400" aria-hidden />
        <span className="mt-2 block text-sm font-semibold text-gray-900">Create a new proposal</span>
      </Link>
    </div>
  );
}
