import { useMatches } from '@remix-run/react';

type SubmissionStepHook = {
  currentStepKey?: string;
  previousPath: string;
  nextPath: string;
};

export function useSubmissionStep(): SubmissionStepHook {
  const matches = useMatches();
  const stepsRoute = matches.find((match) => match.handle?.step === 'root');
  const currentStepKey = matches[matches.length - 1].handle?.step;
  const { steps } = stepsRoute?.data as any;

  console.log(matches);

  if (!steps || !currentStepKey) {
    return { currentStepKey: undefined, previousPath: '', nextPath: '' };
  }

  const currentStepIndex = steps.findIndex((step: any) => step.key === currentStepKey && step.enabled);
  const previousPath = steps?.[currentStepIndex - 1]?.path;
  const nextPath = steps?.[currentStepIndex + 1]?.path;

  return { currentStepKey, previousPath, nextPath };
}
