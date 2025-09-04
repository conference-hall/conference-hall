import { parseWithZod } from '@conform-to/zod/v4';
import * as Firebase from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { href, redirect } from 'react-router';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { H1 } from '~/design-system/typography.tsx';
import { SpeakerProfile } from '~/features/speaker/settings/services/speaker-profile.server.ts';
import { useSpeakerProfile } from '~/features/speaker/speaker-profile-context.tsx';
import { getClientAuth } from '~/shared/auth/firebase.ts';
import { requireUserSession, sendEmailVerification } from '~/shared/auth/session.ts';
import { i18n } from '~/shared/i18n/i18n.server.ts';
import { toast, toastHeaders } from '~/shared/toasts/toast.server.ts';
import { UnlinkProviderSchema } from '~/shared/types/speaker.types.ts';
import { UserAccount } from '~/shared/user/user-account.server.ts';
import { EmailPasswordSchema, EmailSchema } from '~/shared/validators/auth.ts';
import type { Route } from './+types/settings.account.ts';
import { AuthenticationMethods } from './components/authentication-methods.tsx';
import { ChangeContactEmailForm } from './components/change-contact-email-form.tsx';

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
