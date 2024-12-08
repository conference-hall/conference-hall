import type { EventType } from '~/types/events.types.ts';

type Props = {
  type: EventType;
  currentStep: number;
};

export function EventCreationStepper({ type, currentStep }: Props) {
  const totalSteps = type === 'CONFERENCE' ? 3 : 2;

  const steps = Array(totalSteps).fill(0);

  return (
    <nav className="flex items-center" aria-label="Progress">
      <p className="text-sm font-bold">
        Step {currentStep + 1} of {totalSteps}
      </p>
      <ol className="ml-8 flex items-center space-x-5">
        {steps.map((_, stepIdx) => (
          <li key={stepIdx}>
            {stepIdx < currentStep ? (
              <div className="block h-2.5 w-2.5 rounded-full bg-indigo-600 hover:bg-indigo-900" />
            ) : stepIdx === currentStep ? (
              <div className="relative flex items-center justify-center" aria-current="step">
                <span className="absolute flex h-5 w-5 p-px" aria-hidden="true">
                  <span className="h-full w-full rounded-full bg-indigo-200" />
                </span>
                <span className="relative block h-2.5 w-2.5 rounded-full bg-indigo-600" aria-hidden="true" />
              </div>
            ) : (
              <div className="block h-2.5 w-2.5 rounded-full bg-gray-200" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}