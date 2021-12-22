import { useLoaderData } from 'remix';
import { SelectionStep, loadSelection } from '~/features/event-submission/selection.server';
import { ButtonLink } from '~/components/Buttons';
import { Heading } from '../../../components/Heading';
import { TalksEmptyState } from '../../../features/event-submission/components/TalksEmptyState';
import { TalksSelection } from '../../../features/event-submission/components/TalksSelection';
import { Container } from '../../../components/layout/Container';
import { AlertInfo } from '../../../components/Alerts';

export const handle = { step: 'selection' };

export const loader = loadSelection;

export default function EventSubmitRoute() {
  const data = useLoaderData<SelectionStep>();

  return (
    <Container className="my-8 space-y-8">
      <div className="flex justify-between items-center flex-wrap sm:flex-nowrap">
        <Heading description="Select or create a new proposal to submit.">Proposal selection</Heading>
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
        {data?.talks.length === 0 ? <TalksEmptyState /> : <TalksSelection talks={data?.talks} />}
      </div>
    </Container>
  );
}
