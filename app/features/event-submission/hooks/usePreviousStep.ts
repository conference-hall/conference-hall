import { useMatches, useParams } from 'remix';
import { SubmitSteps } from '../steps.server';

export function usePreviousStep() {
  const params = useParams();
  const matches = useMatches();
  const stepsRoute = matches.find((match) => match.pathname === `/${params.eventSlug}/submission`);
  const currentStep = matches[matches.length - 1].handle?.step;
  const steps = stepsRoute?.data as SubmitSteps

  if (!steps || !currentStep) {
    return {}
  }

  const currentStepIndex = steps.findIndex((step) => step.key === currentStep && step.enabled);
  const previousPath = steps?.[currentStepIndex - 1]?.path;

  return previousPath;
}
