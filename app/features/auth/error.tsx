import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { href } from 'react-router';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { Button } from '~/design-system/button.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { ConferenceHallLogo } from '~/design-system/logo.tsx';
import { Text } from '~/design-system/typography.tsx';
import { getAuthError } from '~/shared/better-auth/auth-client.ts';
import type { Route } from './+types/error.ts';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Error | Conference Hall' }]);
};

export default function AuthError() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const redirectTo = params.get('redirectTo') || href('/auth/login');
  const errorCode = params.get('error') || '';
  const errorI18N = getAuthError(errorCode);

  return (
    <Page>
      <header className="flex flex-col items-center pt-8 sm:mx-auto sm:w-full sm:max-w-md sm:pt-16">
        <ConferenceHallLogo width="48px" height="48px" aria-hidden className="fill-slate-300" />
        <h1 className="mt-6 text-center text-2xl leading-9 font-bold tracking-tight text-gray-900">
          {t('error.auth.title')}
        </h1>
      </header>

      <Card className="mt-10 border-red-500 sm:mx-auto sm:w-full sm:max-w-lg">
        <Card.Content>
          <Text align="center" variant="error" weight="semibold">
            {t(errorI18N)}
          </Text>
          <Text as="code" align="center" variant="error" size="xs">
            [{errorCode}]
          </Text>
        </Card.Content>
      </Card>

      <footer className="my-8 flex justify-center gap-1">
        <Button to={redirectTo} variant="secondary" iconLeft={ArrowLeftIcon}>
          {t('common.go-back')}
        </Button>
      </footer>
    </Page>
  );
}
