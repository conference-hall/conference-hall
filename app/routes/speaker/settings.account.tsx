import { parseWithZod } from '@conform-to/zod';
import * as Firebase from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { href, redirect } from 'react-router';
import { SpeakerProfile } from '~/.server/speaker-profile/speaker-profile.ts';
import { UnlinkProviderSchema } from '~/.server/speaker-profile/speaker-profile.types.ts';
import { UserAccount } from '~/.server/user-registration/user-account.ts';
import { getClientAuth } from '~/libs/auth/firebase.ts';
import { requireUserSession, sendEmailVerification } from '~/libs/auth/session.ts';
import { i18n } from '~/libs/i18n/i18n.server.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { toast, toastHeaders } from '~/libs/toasts/toast.server.ts';
import { EmailPasswordSchema, EmailSchema } from '~/libs/validators/auth.ts';
import { useSpeakerProfile } from '~/routes/components/contexts/speaker-profile-context.tsx';
import { H1 } from '~/shared/design-system/typography.tsx';
import type { Route } from './+types/settings.account.ts';
import { AuthenticationMethods } from './components/settings-page/authentication-methods.tsx';
import { ChangeContactEmailForm } from './components/settings-page/change-contact-email-form.tsx';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Account | Conference Hall' }]);
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireUserSession(request);
  return null;
};

export const action = async ({ request }: Route.ActionArgs) => {
  const t = await i18n.getFixedT(request);
  const locale = await i18n.getLocale(request);
  const { userId, uid } = await requireUserSession(request);
  const form = await request.formData();
  const intent = form.get('intent') as string;

  switch (intent) {
    case 'change-contact-email': {
      const result = parseWithZod(form, { schema: EmailSchema });
      if (result.status !== 'success') return toast('error', t('error.global'));

      await SpeakerProfile.for(userId).save(result.value);
      return toast('success', t('settings.account.feedbacks.contact-changed'));
    }
    case 'link-email-provider': {
      const result = parseWithZod(form, { schema: EmailPasswordSchema });
      if (result.status !== 'success') return toast('error', t('error.global'));

      const error = await UserAccount.linkEmailProvider(uid, result.value.email, result.value.password, locale, t);
      if (error) return toast('error', error);

      const headers = await toastHeaders('success', t('settings.account.feedbacks.authentication-method-linked'));
      return redirect(href('/auth/email-verification'), { headers });
    }
    case 'unlink-provider': {
      const result = parseWithZod(form, { schema: UnlinkProviderSchema });
      if (result.status !== 'success') return toast('error', t('error.global'));
      if (result.value.newEmail) {
        await SpeakerProfile.for(userId).save({ email: result.value.newEmail });
      }
      return toast('success', t('settings.account.feedbacks.authentication-method-unlinked'));
    }
    case 'verify-email': {
      await sendEmailVerification(request);
      return toast('success', t('settings.account.feedbacks.verification-email-sent'));
    }
    default:
      return null;
  }
};

export default function AccountRoute() {
  const { t } = useTranslation();
  const [authLoaded, setAuthLoaded] = useState(false);
  const { email } = useSpeakerProfile();

  useEffect(() => {
    // Listen to auth state changes to load the user auth state
    Firebase.onAuthStateChanged(getClientAuth(), (user) => {
      if (!user) return setAuthLoaded(false);
      setAuthLoaded(true);
    });
  }, []);

  return (
    <div className="space-y-4 lg:space-y-6 lg:col-span-9">
      <H1 srOnly>{t('settings.account.heading')}</H1>

      <ChangeContactEmailForm email={email} authLoaded={authLoaded} />

      <AuthenticationMethods email={email} authLoaded={authLoaded} />
    </div>
  );
}
