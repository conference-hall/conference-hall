import { useCatch, useLoaderData } from '@remix-run/react';
import { SelectionStep, loadSelection } from '~/features/events-submission/selection.server';
import { ButtonLink } from '~/components/Buttons';
import { TalksEmptyState } from './components/TalksEmptyState';
import { TalksSelection } from './components/TalksSelection';
import { Container } from '../../../components/layout/Container';
import { AlertInfo } from '../../../components/Alerts';
import { MaxProposalsReached } from './components/MaxProposalsReached';
import { H2, Text } from '../../../components/Typography';

export const handle = { step: 'selection' };

export const loader = loadSelection;

export default function EventSubmitRoute() {
  const data = useLoaderData<SelectionStep>();

  if (data.maxProposals && data.submittedProposals >= data.maxProposals) {
    return (
      <Container className="mt-8">
        <MaxProposalsReached maxProposals={data.maxProposals} />
      </Container>
    );
  }

  if (data?.talks?.length === 0) {
    return (
      <Container className="mt-8">
        <TalksEmptyState />
      </Container>
    );
  }

  return (
    <Container className="my-8 space-y-8">
      <div className="flex justify-between items-center flex-wrap sm:flex-nowrap">
        <div>
          <H2>Proposal selection</H2>
          <Text variant="secondary" className="mt-1">Select or create a new proposal to submit.</Text>
        </div>
        {data?.talks.length !== 0 && (
          <div className="flex-shrink-0">
            <ButtonLink to="new">New proposal</ButtonLink>
          </div>
        )}
      </div>

      {!!data?.maxProposals && (
        <AlertInfo className="my-2">
          You can submit a maximum of <span className="font-semibold">{data.maxProposals} proposals.</span>{' '}
          {data.submittedProposals > 0
            ? `You have already submitted ${data.submittedProposals} proposals out of ${data.maxProposals}.`
            : null}
        </AlertInfo>
      )}

      <div>
        <TalksSelection talks={data?.talks} />
      </div>
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