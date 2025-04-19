import { Callout } from '~/design-system/callout.tsx';
import { Container } from '~/design-system/layouts/container.tsx';

import { useTranslation } from 'react-i18next';
import { ErrorDisplay } from './error-display.tsx';

type Props = { error: Error };

export function UnexpectedError({ error }: Props) {
  const { t } = useTranslation();
  return (
    <ErrorDisplay title={t('error.unexpected-error.heading')} subtitle={t('error.unexpected-error.description')}>
      <Container className="pt-8 text-left">
        <Callout title={error.message} variant="error">
          {error.stack ? <div dangerouslySetInnerHTML={{ __html: error.stack?.replaceAll('\n', '<br/>') }} /> : null}
        </Callout>
      </Container>
    </ErrorDisplay>
  );
}
