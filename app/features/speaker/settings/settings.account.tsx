import { useTranslation } from 'react-i18next';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { H1 } from '~/design-system/typography.tsx';
import { useSpeakerProfile } from '~/features/speaker/speaker-profile-context.tsx';
import { RequireAuthContext } from '~/shared/authentication/auth.middleware.ts';
import { getI18n } from '~/shared/i18n/i18n.middleware.ts';
import { toastHeaders } from '~/shared/toasts/toast.server.ts';
import { UserAccount } from '~/shared/user/user-account.server.ts';
import { getWebServerEnv } from '../../../../servers/environment.server.ts';
import { signOut } from '../../../auth.server.ts';
import type { Route } from './+types/settings.account.ts';
import { DeleteAccountSection } from './components/delete-account-section.tsx';
import { EmailPasswordSection } from './components/email-password-section.tsx';
import { SocialAccountsSection } from './components/social-accounts-section.tsx';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Account | Conference Hall' }]);
};

export const loader = async ({ context }: Route.LoaderArgs) => {
  const user = context.get(RequireAuthContext);
  const accounts = await UserAccount.for(user.id).getAccounts();
  const { CAPTCHA_SITE_KEY } = getWebServerEnv();
  return { accounts, captchaSiteKey: CAPTCHA_SITE_KEY };
};

export const action = async ({ request, context }: Route.ActionArgs) => {
  const user = context.get(RequireAuthContext);
  const i18n = getI18n(context);
  const form = await request.formData();
  const intent = form.get('intent') as string;

  switch (intent) {
    case 'delete-account': {
      await UserAccount.for(user.id).deleteAccount();
      const headers = await toastHeaders('success', i18n.t('settings.account.feedbacks.account-deleted'));
      await signOut(request, '/', headers);
    }
    default:
      return null;
  }
};

export default function AccountRoute({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { email } = useSpeakerProfile();
  const { accounts, captchaSiteKey } = loaderData;

  const hasPassword = accounts.some((account) => account.providerId === 'credential');

  return (
    <div className="space-y-4 lg:col-span-9 lg:space-y-6">
      <H1 srOnly>{t('settings.account.heading')}</H1>

      <EmailPasswordSection email={email} hasPassword={hasPassword} captchaSiteKey={captchaSiteKey} />

      <SocialAccountsSection accounts={accounts} />

      <DeleteAccountSection />
    </div>
  );
}
