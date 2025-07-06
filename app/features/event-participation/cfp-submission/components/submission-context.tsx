import { createContext, type ReactNode, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { href, useMatches } from 'react-router';

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
  const { t } = useTranslation();
  const talk = talkId || 'new';

  const steps = useMemo(
    () =>
      [
        {
          key: 'selection',
          name: t('event.submission.steps.selection'),
          path: href('/:event/submission', { event: eventSlug }),
          enabled: true,
        },
        {
          key: 'proposal',
          name: t('event.submission.steps.proposal'),
          path: href('/:event/submission/:talk', { event: eventSlug, talk }),
          enabled: true,
        },
        {
          key: 'speakers',
          name: t('event.submission.steps.speakers'),
          path: href('/:event/submission/:talk/speakers', { event: eventSlug, talk }),
          enabled: true,
        },
        {
          key: 'tracks',
          name: t('event.submission.steps.tracks'),
          path: href('/:event/submission/:talk/tracks', { event: eventSlug, talk }),
          enabled: hasTracks,
        },
        {
          key: 'survey',
          name: t('event.submission.steps.survey'),
          path: href('/:event/submission/:talk/survey', { event: eventSlug, talk }),
          enabled: hasSurvey,
        },
        {
          key: 'submission',
          name: t('event.submission.steps.submission'),
          path: href('/:event/submission/:talk/submit', { event: eventSlug, talk }),
          enabled: true,
        },
      ].filter((step) => step.enabled),
    [eventSlug, talk, hasTracks, hasSurvey, t],
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
