import { useMatches } from '@remix-run/react';
import { type ReactNode, createContext, useContext } from 'react';

type Step = {
  key: string;
  name: string;
  path: string;
  previousPath: string | null;
  nextPath: string | null;
  form?: string;
  enabled: boolean;
};

const SubmissionContext = createContext<Array<Step> | undefined>(undefined);

type SubmissionProps = { eventSlug: string; talkId?: string; hasTracks: boolean; hasSurvey: boolean };
type SubmissionContextProviderProps = SubmissionProps & { children: ReactNode };

export const SubmissionContextProvider = ({
  eventSlug,
  talkId,
  hasTracks,
  hasSurvey,
  children,
}: SubmissionContextProviderProps) => {
  const steps = getSteps({ eventSlug, talkId, hasTracks, hasSurvey });

  return <SubmissionContext.Provider value={steps}>{children}</SubmissionContext.Provider>;
};

function getSteps({ eventSlug, talkId, hasTracks, hasSurvey }: SubmissionProps): Array<Step> {
  return [
    {
      key: 'selection',
      name: 'Selection',
      form: undefined,
      path: `/${eventSlug}/submission`,
      nextPath: `/${eventSlug}/submission/${talkId}`,
      previousPath: null,
      enabled: true,
    },
    {
      key: 'proposal',
      name: 'Proposal',
      form: 'proposal-form',
      path: `/${eventSlug}/submission/${talkId}`,
      nextPath: `/${eventSlug}/submission/${talkId}/speakers`,
      previousPath: `/${eventSlug}/submission`,
      enabled: true,
    },
    {
      key: 'speakers',
      name: 'Speakers',
      form: 'speakers-form',
      path: `/${eventSlug}/submission/${talkId}/speakers`,
      nextPath: hasTracks
        ? `/${eventSlug}/submission/${talkId}/tracks`
        : hasSurvey
          ? `/${eventSlug}/submission/${talkId}/survey`
          : `/${eventSlug}/submission/${talkId}/submit`,
      previousPath: `/${eventSlug}/submission/${talkId}`,
      enabled: true,
    },
    {
      key: 'tracks',
      name: 'Tracks',
      form: 'tracks-form',
      path: `/${eventSlug}/submission/${talkId}/tracks`,
      nextPath: hasSurvey ? `/${eventSlug}/submission/${talkId}/survey` : `/${eventSlug}/submission/${talkId}/submit`,
      previousPath: `/${eventSlug}/submission/${talkId}/speakers`,
      enabled: hasTracks,
    },
    {
      key: 'survey',
      name: 'Survey',
      form: 'survey-form',
      path: `/${eventSlug}/submission/${talkId}/survey`,
      nextPath: `/${eventSlug}/submission/${talkId}/submit`,
      previousPath: hasTracks
        ? `/${eventSlug}/submission/${talkId}/tracks`
        : `/${eventSlug}/submission/${talkId}/speakers`,
      enabled: hasSurvey,
    },
    {
      key: 'submission',
      name: 'Submission',
      form: undefined,
      path: `/${eventSlug}/submission/${talkId}/submit`,
      nextPath: null,
      previousPath: hasTracks
        ? `/${eventSlug}/submission/${talkId}/tracks`
        : hasSurvey
          ? `/${eventSlug}/submission/${talkId}/survey`
          : `/${eventSlug}/submission/${talkId}/speakers`,
      enabled: true,
    },
  ].filter((step) => step.enabled);
}

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

export function useCurrentStep() {
  const currentStep = useCurrentStepName();
  const steps = useSteps();
  return steps.find((step) => step.key === currentStep);
}
