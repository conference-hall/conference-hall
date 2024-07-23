import { ButtonLink } from '~/design-system/buttons.tsx';

import { ErrorDisplay } from './error-display.tsx';

export function InternalServerError() {
  return (
    <ErrorDisplay title="Internal Server Error" subtitle="Whoops! We are already working to solve the problem.">
      <div className="pt-8">
        <ButtonLink to="/">Go to Home</ButtonLink>
      </div>
    </ErrorDisplay>
  );
}
