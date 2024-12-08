import { ButtonLink } from '~/design-system/buttons.tsx';

import { ErrorDisplay } from './error-display.tsx';

type Props = { text?: string };

export function NotFound({ text = 'Page not found' }: Props) {
  return (
    <ErrorDisplay title={text} subtitle="Whoops! That page doesn’t exist.">
      <div className="pt-8">
        <ButtonLink to="/">Go to Home</ButtonLink>
      </div>
    </ErrorDisplay>
  );
}
