import { useMatches } from '@remix-run/react';

type SubmissionStepHook = {
  currentStepKey?: string;
  previousPath: string;
  nextPath: string;
};

type StepHandler = { step: string };

function getHandlerStep(handle: unknown): StepHandler | null {
  return handle as StepHandler;
}

export function useSubmissionStep(): SubmissionStepHook {
  const matches = useMatches();
  const stepsRoute = matches.find((match) => getHandlerStep(match.handle)?.step === 'root');
  const currentStepKey = getHandlerStep(matches[matches.length - 1].handle)?.step;
  const { steps } = stepsRoute?.data as any;

  if (!steps || !currentStepKey) {
    return { currentStepKey: undefined, previousPath: '', nextPath: '' };
  }

  const currentStepIndex = steps.findIndex((step: any) => step.key === currentStepKey && step.enabled);
  const previousPath = steps?.[currentStepIndex - 1]?.path;
  const nextPath = steps?.[currentStepIndex + 1]?.path;

  return { currentStepKey, previousPath, nextPath };
}
