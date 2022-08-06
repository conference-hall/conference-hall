import { useCatch, useLoaderData } from '@remix-run/react';
import { ButtonLink } from '~/design-system/Buttons';
import { Container } from '../../../design-system/Container';
import { AlertInfo } from '../../../design-system/Alerts';
import { MaxProposalsReached } from '../../../components/MaxProposalsReached';
import { H2, Text } from '../../../design-system/Typography';
import { sessionRequired } from '../../../services/auth/auth.server';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import type { ProposalCountsForEvent, TalksToSubmit } from '../../../services/events/submit.server';
import { fetchTalksToSubmitForEvent, getProposalCountsForEvent } from '../../../services/events/submit.server';
import { mapErrorToResponse } from '../../../services/errors';
import { SubmissionTalksList } from '../../../components/SubmissionTalksList';

type SelectionStep = {
  talks: TalksToSubmit;
  proposalsCount: ProposalCountsForEvent;
};

export const handle = { step: 'selection' };

export const loader: LoaderFunction = async ({ request, params }) => {
  const uid = await sessionRequired(request);
  const slug = params.eventSlug!;

  try {
    const talks = await fetchTalksToSubmitForEvent(uid, slug);
    const proposalsCount = await getProposalCountsForEvent(uid, slug);
    return json<SelectionStep>({ talks, proposalsCount });
  } catch (err) {
    mapErrorToResponse(err);
  }
};

export default function EventSubmitRoute() {
  const data = useLoaderData<SelectionStep>();
  const { max, submitted } = data.proposalsCount;

  if (max && submitted >= max) {
    return (
      <Container className="mt-8">
        <MaxProposalsReached maxProposals={max} />
      </Container>
    );
  }

  return (
    <Container className="my-8 space-y-8">
      <div className="flex flex-wrap items-center justify-between sm:flex-nowrap">
        <div>
          <H2>Proposal selection</H2>
          <Text variant="secondary" className="mt-1">
            Select or create a new proposal to submit.
          </Text>
        </div>
        {data?.talks.length !== 0 && (
          <div className="flex-shrink-0">
            <ButtonLink to="new">New proposal</ButtonLink>
          </div>
        )}
      </div>

      {Boolean(max) && (
        <AlertInfo className="my-2">
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
