import { LoaderFunction, useLoaderData } from 'remix';
import { TalkSelectionStep, loadTalksSelection } from '~/features/event-submission/selection.server';
import { ButtonLink } from '~/components/Buttons';
import { requireUserSession } from '~/features/auth/auth.server';
import { Heading } from '../../../components/Heading';
import { TalksEmptyState } from '../../../features/event-submission/components/TalksEmptyState';
import { TalksSelection } from '../../../features/event-submission/components/TalksSelection';
import { Container } from '../../../components/layout/Container';

export const handle = { step: 'selection' };

export const loader: LoaderFunction = async ({ request, context, params }) => {
  await requireUserSession(request);
  return loadTalksSelection({ request, context, params });
};

export default function EventSubmitRoute() {
  const data = useLoaderData<TalkSelectionStep>();

  if (data.length === 0) {
    return <TalksEmptyState />;
  }
  return (
    <Container className="mt-8">
      <div className="flex justify-between items-center flex-wrap sm:flex-nowrap">
        <Heading description="Select or create a new proposal to submit.">Proposal selection</Heading>
        <div className="flex-shrink-0">
          <ButtonLink to="new">New proposal</ButtonLink>
        </div>
      </div>
      <div className="mt-8">
        <TalksSelection talks={data} />
      </div>
    </Container>
  );
}
