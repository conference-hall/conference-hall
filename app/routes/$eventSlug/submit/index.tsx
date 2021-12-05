import { LoaderFunction, useLoaderData } from 'remix';
import { TalkSelectionStep, loadTalksSelection } from '~/features/event-submission/load-talks-selection.server';
import { ButtonLink } from '~/components/Buttons';
import { requireUserSession } from '~/features/auth/auth.server';
import { Heading } from '../../../components/Heading';
import { TalksEmptyState } from '../../../features/event-submission/components/TalksEmptyState';
import { TalksSelection } from '../../../features/event-submission/components/TalksSelection';

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
    <>
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center flex-wrap sm:flex-nowrap">
        <Heading description="Select or create a new proposal to submit.">Proposal selection</Heading>
        <div className="flex-shrink-0">
          <ButtonLink to="talk/new">New proposal</ButtonLink>
        </div>
      </div>
      <TalksSelection talks={data} />
    </>
  );
}
