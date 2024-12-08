import { type ReactNode, createContext, useContext, useMemo } from 'react';
import { useMatches } from 'react-router';

type Step = { key: string; name: string; path: string; enabled: boolean };

type SubmissionContextProviderProps = {
  eventSlug: string;
  talkId?: string;
  hasTracks: boolean;
  hasSurvey: boolean;
  children: ReactNode;
};

const SubmissionContext = createContext<Array<Step> | undefined>(undefined);

export const SubmissionContextProvider = ({
  eventSlug,
  talkId,
  hasTracks,
  hasSurvey,
  children,
}: SubmissionContextProviderProps) => {
  const currentTalkId = talkId || 'new';

  const steps = useMemo(
    () =>
      [
        {
          key: 'selection',
          name: 'Selection',
          path: `/${eventSlug}/submission`,
          enabled: true,
        },
        {
          key: 'proposal',
          name: 'Proposal',
          path: `/${eventSlug}/submission/${currentTalkId}`,
          enabled: true,
        },
        {
          key: 'speakers',
          name: 'Speakers',
          path: `/${eventSlug}/submission/${currentTalkId}/speakers`,
          enabled: true,
        },
        {
          key: 'tracks',
          name: 'Tracks',
          path: `/${eventSlug}/submission/${currentTalkId}/tracks`,
          enabled: hasTracks,
        },
        {
          key: 'survey',
          name: 'Survey',
          path: `/${eventSlug}/submission/${currentTalkId}/survey`,
          enabled: hasSurvey,
        },
        {
          key: 'submission',
          name: 'Submission',
          path: `/${eventSlug}/submission/${currentTalkId}/submit`,
          enabled: true,
        },
      ].filter((step) => step.enabled),
    [eventSlug, currentTalkId, hasTracks, hasSurvey],
  );

  return <SubmissionContext.Provider value={steps}>{children}</SubmissionContext.Provider>;
};

export function useSteps() {
  const context = useContext(SubmissionContext);
  if (context === undefined) {
    throw new Error('useCurrentStep must be used within a SubmissionContextProvider');
  }
  return context;
}

export function useCurrentStepName() {
  const matches = useMatches();
  const handle = matches[matches.length - 1].handle as { step: string };
  return handle.step;
}

export function useSubmissionNavigation() {
  const currentStep = useCurrentStepName();
  const steps = useSteps();

  const currentStepIndex = steps.findIndex((step) => step.key === currentStep);
  const previousStep = steps[currentStepIndex - 1];
  const nextStep = steps[currentStepIndex + 1];

  let previousPath = '';
  let nextPath = '';

  if (previousStep && !nextStep) {
    previousPath = previousStep.path;
  } else if (!previousStep && nextStep) {
    nextPath = nextStep.path;
  } else {
    previousPath = previousStep.path;
    nextPath = nextStep.path;
  }

  return useMemo(() => ({ previousPath, nextPath }), [previousPath, nextPath]);
}
