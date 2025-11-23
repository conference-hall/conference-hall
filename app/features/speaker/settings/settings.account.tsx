import { parseWithZod } from '@conform-to/zod/v4';
import * as Firebase from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { href, redirect } from 'react-router';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { DeleteModalButton } from '~/design-system/dialogs/delete-modal.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H1, H2, Subtitle, Text } from '~/design-system/typography.tsx';
import { SpeakerProfile } from '~/features/speaker/settings/services/speaker-profile.server.ts';
import { useSpeakerProfile } from '~/features/speaker/speaker-profile-context.tsx';
import { getProtectedSession } from '~/shared/auth/auth.middleware.ts';
import { getClientAuth } from '~/shared/auth/firebase.ts';
import { destroySession, sendEmailVerification } from '~/shared/auth/session.ts';
import { getI18n, getLocale } from '~/shared/i18n/i18n.middleware.ts';
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

export const action = async ({ request, context }: Route.ActionArgs) => {
  const { userId, uid } = getProtectedSession(context);
  const i18n = getI18n(context);
  const locale = getLocale(context);
  const form = await request.formData();
  const intent = form.get('intent') as string;

  switch (intent) {
    case 'change-contact-email': {
      const result = parseWithZod(form, { schema: EmailSchema });
      if (result.status !== 'success') return toast('error', i18n.t('error.global'));

      await SpeakerProfile.for(userId).save(result.value);
      return toast('success', i18n.t('settings.account.feedbacks.contact-changed'));
    }
    case 'link-email-provider': {
      const result = parseWithZod(form, { schema: EmailPasswordSchema });
      if (result.status !== 'success') return toast('error', i18n.t('error.global'));

      const error = await UserAccount.linkEmailProvider(uid, result.value.email, result.value.password, locale, i18n.t);
      if (error) return toast('error', error);

      const headers = await toastHeaders('success', i18n.t('settings.account.feedbacks.authentication-method-linked'));
      return redirect(href('/auth/email-verification'), { headers });
    }
    case 'unlink-provider': {
      const result = parseWithZod(form, { schema: UnlinkProviderSchema });
      if (result.status !== 'success') return toast('error', i18n.t('error.global'));
      if (result.value.newEmail) {
        await SpeakerProfile.for(userId).save({ email: result.value.newEmail });
      }
      return toast('success', i18n.t('settings.account.feedbacks.authentication-method-unlinked'));
    }
    case 'verify-email': {
      await sendEmailVerification(request, context);
      return toast('success', i18n.t('settings.account.feedbacks.verification-email-sent'));
    }
    case 'delete-account': {
      await UserAccount.deleteAccount(userId, locale);
      const headers = await toastHeaders('success', i18n.t('settings.account.feedbacks.account-deleted'));
      await destroySession(request, '/', headers);
      return null;
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

      <Card as="section" className="border-red-300">
        <Card.Title>
          <H2>{t('settings.account.danger.heading')}</H2>
        </Card.Title>

        <ul className="divide-y border-t mt-8">
          <li className="p-4 lg:px-8 flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="space-y-1 grow">
              <Text weight="semibold">{t('settings.account.danger.delete-account.heading')}</Text>
              <Subtitle>{t('settings.account.danger.delete-account.description')}</Subtitle>
            </div>
            <DeleteModalButton
              intent="delete-account"
              title={t('settings.account.danger.delete-account.button')}
              description={t('settings.account.danger.delete-account.modal.description')}
              confirmationText={t('settings.account.danger.delete-account.confirmation-text')}
            />
          </li>
        </ul>
      </Card>
    </div>
  );
}
