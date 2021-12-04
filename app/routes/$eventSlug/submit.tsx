import { CheckIcon } from '@heroicons/react/solid';
import { LoaderFunction, Outlet, useLoaderData, useMatches } from 'remix';
import { Steps } from '../../components/event-submission/Steps';
import { Container } from '../../components/ui/Container';
import { SectionPanel } from '../../components/ui/Panels';
import { requireUserSession } from '../../server/auth/auth.server';
import { getSubmitSteps, SubmitSteps } from '../../server/event/submit/get-submit-steps.server';

export const loader: LoaderFunction = async ({ request, context, params }) => {
  await requireUserSession(request);
  return getSubmitSteps({ request, context, params });
};

export default function EventSubmitRoute() {
  const steps = useLoaderData<SubmitSteps>()
  const matches = useMatches();
  const currentStep = matches[matches.length - 1].handle?.step

  return (
    <Container className="-mt-24 grid grid-cols-1 items-start sm:gap-8">
      <SectionPanel id="talk-submission" title="Talk submission">
        <Steps steps={steps} currentStep={currentStep} />
        <div className="overflow-hidden sm:rounded-md">
          <Outlet />
        </div>
      </SectionPanel>
    </Container>
  );
}


