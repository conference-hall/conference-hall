import { LoaderFunction, useLoaderData } from 'remix';
import { TalkSelectionStep, getTalkSelectionStep } from '~/server/event/submit/get-talk-selection-step.server';
import { TalksEmptyState } from '~/components/event-submission/TalksEmptyState';
import { TalksSelection } from '~/components/event-submission/TalksSelection';
import { ButtonLink } from '~/components/ui/Buttons';
import { requireUserSession } from '~/server/auth/auth.server';
import { Heading } from '../../../components/ui/Heading';

export const handle = { step: 'selection' };

export const loader: LoaderFunction = async ({ request, context, params }) => {
  await requireUserSession(request);
  return getTalkSelectionStep({ request, context, params });
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
