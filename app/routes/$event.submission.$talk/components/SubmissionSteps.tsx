import { CheckIcon } from '@heroicons/react/20/solid';
import { Link } from '@remix-run/react';

type Props = {
  steps: Array<{
    key: string;
    path: string;
    name: string;
  }>;
  currentStep: string;
};

function SubmissionStepsMobile({ steps, currentStep }: Props) {
  const currentStepIdx = steps.findIndex((step) => step.key === currentStep);

  return (
    <nav className="mt-6 flex items-center md:hidden" aria-label="Progress">
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

function SubmissionStepsDesktop({ steps, currentStep }: Props) {
  const currentStepIdx = steps.findIndex((step) => step.key === currentStep);

  return (
    <nav aria-label="Progress" className="hidden md:block">
      <ol className="divide-y divide-gray-200 border-b border-gray-200 md:flex md:divide-y-0">
        {steps.map((step, stepIdx) => (
          <li
            key={step.key}
            className="relative md:flex md:flex-1"
            aria-current={stepIdx === currentStepIdx ? 'step' : undefined}
          >
            {stepIdx < currentStepIdx ? (
              <Link to={step.path} className="group flex w-full items-center">
                <span className="flex items-center px-6 py-4 text-sm font-medium">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 group-hover:bg-indigo-800">
                    <CheckIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </span>
                  <span className="ml-4 text-sm font-medium text-gray-900">{step.name}</span>
                </span>
              </Link>
            ) : stepIdx === currentStepIdx ? (
              <span className="flex items-center px-6 py-4 text-sm font-medium">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-indigo-600">
                  <span className="text-indigo-600">{stepIdx + 1}</span>
                </span>
                <span className="ml-4 text-sm font-medium text-indigo-600">{step.name}</span>
              </span>
            ) : (
              <span className="flex items-center">
                <span className="flex items-center px-6 py-4 text-sm font-medium">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-200">
                    <span className="text-gray-500">{stepIdx + 1}</span>
                  </span>
                  <span className="ml-4 text-sm font-medium text-gray-500">{step.name}</span>
                </span>
              </span>
            )}

            {stepIdx !== steps.length - 1 ? (
              <>
                {/* Arrow separator for lg screens and up */}
                <div className="absolute right-0 top-0 hidden h-full w-5 md:block" aria-hidden="true">
                  <svg
                    className="h-full w-full text-gray-200"
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

export function SubmissionSteps(props: Props) {
  return (
    <>
      <SubmissionStepsMobile {...props} />
      <SubmissionStepsDesktop {...props} />
    </>
  );
}
