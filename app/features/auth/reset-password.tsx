import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { Link } from '~/design-system/links.tsx';
import { ConferenceHallLogo } from '~/design-system/logo.tsx';
import { Subtitle } from '~/design-system/typography.tsx';
import { getAuthError } from '~/shared/better-auth/auth-client.ts';
import type { Route } from './+types/reset-password.ts';
import { ResetPasswordForm } from './components/reset-password-form.tsx';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Reset password | Conference Hall' }]);
};

export default function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const errorCode = searchParams.get('error');
  const defaultError = errorCode ? getAuthError({ code: errorCode }) : null;

  return (
    <Page>
      <header className="flex flex-col items-center pt-8 sm:mx-auto sm:w-full sm:max-w-md sm:pt-16">
        <ConferenceHallLogo width="48px" height="48px" aria-hidden className="fill-slate-300" />
        <h2 className="mt-6 text-center text-2xl leading-9 font-bold tracking-tight text-gray-900">
          {t('auth.reset-password.heading')}
        </h2>
      </header>

      <Card className="mt-10 space-y-8 p-6 sm:mx-auto sm:w-full sm:max-w-lg sm:p-12">
        <Subtitle>{t('auth.reset-password.description')}</Subtitle>

        <ResetPasswordForm
          token={token}
          defaultError={defaultError}
          onSuccess={() => {
            toast.success(t('auth.reset-password.toast.success'));
            navigate({ pathname: '/auth/login' });
          }}
        />
      </Card>

      <footer className="my-8 text-center">
        <Link to="/auth/login" weight="semibold">
          {t('auth.common.go-back-login')}
        </Link>
      </footer>
    </Page>
  );
}
