import invariant from 'tiny-invariant';
import { useCatch, useLoaderData } from '@remix-run/react';
import { ButtonLink } from '~/design-system/Buttons';
import { Container } from '../design-system/Container';
import { AlertInfo } from '../design-system/Alerts';
import { MaxProposalsReached } from '../components/MaxProposalsReached';
import { H2, Text } from '../design-system/Typography';
import { sessionRequired } from '../libs/auth/auth.server';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { mapErrorToResponse } from '../libs/errors';
import { SubmissionTalksList } from '../components/SubmissionTalksList';
import { getProposalCountsForEvent, listTalksToSubmit } from '~/services/event-submission/list-talks-to-submit.server';

export const handle = { step: 'selection' };

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
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
    return (
      <Container className="mt-8">
        <MaxProposalsReached maxProposals={max} />
      </Container>
    );
  }

  return (
    <Container className="my-4 sm:my-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <H2>Proposal selection</H2>
          <Text variant="secondary" className="mt-1">
            Select or create a new proposal to submit.
          </Text>
        </div>
        {data?.talks.length !== 0 && <ButtonLink to="new">Create a new proposal</ButtonLink>}
      </div>

      {Boolean(max) && (
        <AlertInfo className="my-4">
          You can submit a maximum of <span className="font-semibold">{max} proposals.</span>{' '}
          {submitted > 0 ? `You have already submitted ${submitted} proposals out of ${max}.` : null}
        </AlertInfo>
      )}

      <SubmissionTalksList talks={data?.talks} />
    </Container>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  return (
    <Container className="my-8 px-8 py-32 text-center">
      <h1 className="text-8xl font-black text-indigo-400">{caught.status}</h1>
      <p className="mt-10 text-4xl font-bold text-gray-600">{caught.data}</p>
    </Container>
  );
}
