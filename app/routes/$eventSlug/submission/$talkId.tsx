import { Outlet, useCatch, useLoaderData, useMatches } from 'remix';
import { Container } from '../../../components/layout/Container';
import { SectionPanel } from '../../../components/Panels';
import { Steps } from '../../../features/event-submission/components/Steps';
import { loadSubmissionSteps, SubmitSteps } from '../../../features/event-submission/steps.server';

export const handle = { step: 'root' };

export const loader = loadSubmissionSteps;

export default function EventSubmitRoute() {
  const steps = useLoaderData<SubmitSteps>()
  const matches = useMatches();
  const currentStep = matches[matches.length - 1].handle?.step

  return (
    <Container className="my-8 grid grid-cols-1 items-start sm:gap-8">
      <SectionPanel id="talk-submission" title="Talk submission">
        <Steps steps={steps} currentStep={currentStep} />
        <div className="overflow-hidden sm:rounded-md">
          <Outlet />
        </div>
      </SectionPanel>
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


