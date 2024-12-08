import { Callout } from '~/design-system/callout.tsx';
import { Container } from '~/design-system/layouts/container.tsx';

import { ErrorDisplay } from './error-display.tsx';

type Props = { error: Error };

export function UnexpectedError({ error }: Props) {
  return (
    <ErrorDisplay title="Unexpected error" subtitle="Whoops! Something gets wrong.">
      <Container className="pt-8 text-left">
        <Callout title={error.message} variant="error">
          {error.stack ? <div dangerouslySetInnerHTML={{ __html: error.stack?.replaceAll('\n', '<br/>') }} /> : null}
        </Callout>
      </Container>
    </ErrorDisplay>
  );
}
