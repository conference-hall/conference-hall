import { ButtonLink } from '~/design-system/buttons.tsx';

import { ErrorDisplay } from './error-display.tsx';

type Props = { text?: string };

export function Forbidden({ text = 'Forbidden action' }: Props) {
  return (
    <ErrorDisplay title={text} subtitle="Whoops! You cannot do that.">
      <div className="pt-8">
        <ButtonLink to="/">Go to Home</ButtonLink>
      </div>
    </ErrorDisplay>
  );
}
