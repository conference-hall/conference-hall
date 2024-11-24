import { CheckIcon } from '@heroicons/react/20/solid';
import { Link } from '@remix-run/react';
import { useCurrentStepName, useSteps } from './submission-context.tsx';

type Props = {
  steps: Array<{ key: string; path: string; name: string }>;
  currentStep?: string;
};

function StepsMobile({ steps, currentStep }: Props) {
  const currentStepIdx = steps.findIndex((step) => step.key === currentStep);

  return (
    <nav className="flex items-center xl:hidden sm:pl-40" aria-label="Progress">
      <p className="text-sm font-bold">
        Step {currentStepIdx + 1} of {steps.length}
      </p>
      <ol className="ml-8 flex items-center space-x-5">
        {steps.map((step, stepIdx) => (
          <li key={step.key}>
            {stepIdx < currentStepIdx ? (
              <Link to={step.path} className="block h-2.5 w-2.5 rounded-full bg-indigo-600 hover:bg-indigo-900">
                <span className="sr-only">{step.name}</span>
              </Link>
            ) : stepIdx === currentStepIdx ? (
              <Link to={step.path} className="relative flex items-center justify-center" aria-current="step">
                <span className="absolute flex h-5 w-5 p-px" aria-hidden="true">
                  <span className="h-full w-full rounded-full bg-indigo-200" />
                </span>
                <span className="relative block h-2.5 w-2.5 rounded-full bg-indigo-600" aria-hidden="true" />
                <span className="sr-only">{step.name}</span>
              </Link>
            ) : (
              <div className="block h-2.5 w-2.5 rounded-full bg-gray-200">
                <span className="sr-only">{step.name}</span>
              </div>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function StepsDesktop({ steps, currentStep }: Props) {
  const currentStepIdx = steps.findIndex((step) => step.key === currentStep);

  return (
    <nav aria-label="Progress" className="hidden xl:block sm:pl-40">
      <ol className="divide-y divide-gray-300 rounded-full border  border-gray-300 md:flex md:divide-y-0">
        {steps.map((step, stepIdx) => (
          <li
            key={step.key}
            className="relative md:flex md:flex-1"
            aria-current={stepIdx === currentStepIdx ? 'step' : undefined}
          >
            {stepIdx < currentStepIdx ? (
              <Link to={step.path} className="group flex w-full items-center">
                <span className="flex items-center px-4 py-1.5 text-sm font-medium">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 group-hover:bg-indigo-800">
                    <CheckIcon className="h-4 w-4 text-white" aria-hidden="true" />
                  </span>
                  <span className="mx-4 text-sm font-medium text-gray-900">{step.name}</span>
                </span>
              </Link>
            ) : stepIdx === currentStepIdx ? (
              <span className="flex items-center px-4 py-1.5 text-sm font-medium">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-indigo-600">
                  <span className="text-indigo-600">{stepIdx + 1}</span>
                </span>
                <span className="mx-4 text-sm font-medium text-indigo-600">{step.name}</span>
              </span>
            ) : (
              <span className="flex items-center">
                <span className="flex items-center px-4 py-1.5 text-sm font-medium">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-gray-300">
                    <span className="text-gray-500">{stepIdx + 1}</span>
                  </span>
                  <span className="mx-4 text-sm font-medium text-gray-500">{step.name}</span>
                </span>
              </span>
            )}

            {stepIdx !== steps.length - 1 ? (
              <>
                {/* Arrow separator for lg screens and up */}
                <div className="absolute right-0 top-0 hidden h-full w-5 md:block" aria-hidden="true">
                  <svg
                    role="presentation"
                    className="h-full w-full text-gray-300"
                    viewBox="0 0 22 80"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 -2L20 40L0 82"
                      vectorEffect="non-scaling-stroke"
                      stroke="currentcolor"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Steps() {
  const steps = useSteps();
  const currentStepName = useCurrentStepName();
  return (
    <>
      <StepsMobile steps={steps} currentStep={currentStepName} />
      <StepsDesktop steps={steps} currentStep={currentStepName} />
    </>
  );
}
