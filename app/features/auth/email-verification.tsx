import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { href } from 'react-router';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { Link } from '~/design-system/links.tsx';
import { ConferenceHallLogo } from '~/design-system/logo.tsx';
import { Subtitle } from '~/design-system/typography.tsx';
import type { Route } from './+types/email-verification.ts';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Email verification | Conference Hall' }]);
};

export default function EmailVerificationSent() {
  const { t } = useTranslation();
  return (
    <Page>
      <header className="flex flex-col items-center pt-8 sm:mx-auto sm:w-full sm:max-w-md sm:pt-16">
        <ConferenceHallLogo width="48px" height="48px" aria-hidden className="fill-slate-300" />
        <h2 className="mt-6 text-center text-2xl leading-9 font-bold tracking-tight text-gray-900">
          {t('auth.email-verification.heading')}
        </h2>
      </header>

      <Card className="mt-10 space-y-8 p-6 sm:mx-auto sm:w-full sm:max-w-lg sm:p-12">
        <EnvelopeIcon className="mx-auto size-16 text-slate-300" />
        <div className="flex flex-col items-center gap-4">
          <Subtitle align="center">{t('auth.email-verification.confirmation')}</Subtitle>
          <Subtitle align="center" weight="semibold">
            {t('auth.common.check-inbox')}
          </Subtitle>
        </div>
      </Card>

      <footer className="my-8 flex justify-center gap-1">
        <Subtitle>{t('auth.common.go-back')}</Subtitle>
        <Link to={href('/auth/login')} weight="semibold">
          {t('auth.common.sign-in')}
        </Link>
      </footer>
    </Page>
  );
}
