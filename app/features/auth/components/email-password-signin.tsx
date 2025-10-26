import { Turnstile } from '@marsidev/react-turnstile';
import * as Firebase from 'firebase/auth';
import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { href, useFetcher } from 'react-router';
import { Button } from '~/design-system/buttons.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { PasswordInput } from '~/design-system/forms/password-input.tsx';
import { getFirebaseError } from '~/shared/auth/firebase.errors.ts';
import { getClientAuth } from '~/shared/auth/firebase.ts';

type EmailPasswordSigninProps = { redirectTo: string; defaultEmail: string | null; captchaSiteKey: string };

export function EmailPasswordSignin({ redirectTo, defaultEmail, captchaSiteKey }: EmailPasswordSigninProps) {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [email, setEmail] = useState(defaultEmail || '');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string>('');

  const fetcher = useFetcher();

  const loading = submitting || fetcher.state !== 'idle';
  const forgotPasswordPath = email ? `${href('/auth/forgot-password')}?email=${email}` : href('/auth/forgot-password');

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return;
    try {
      setError('');
      setSubmitting(true);

      if (!captchaToken) {
        setError(t('common.captcha-required'));
        return;
      }

      const credentials = await Firebase.signInWithEmailAndPassword(getClientAuth(), email, password);
      const token = await credentials.user.getIdToken();
      await fetcher.submit({ token, captchaToken, redirectTo }, { method: 'POST', action: href('/auth/login') });
    } catch (error) {
      setError(getFirebaseError(error, t));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <fetcher.Form className="space-y-4" onSubmit={signIn}>
      <Input
        label={t('common.email')}
        placeholder={t('common.email.placeholder')}
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <PasswordInput value={password} onChange={setPassword} forgotPasswordPath={forgotPasswordPath} />

      <Turnstile siteKey={captchaSiteKey} onSuccess={setCaptchaToken} options={{ theme: 'light', size: 'flexible' }} />

      <Button type="submit" variant="primary" loading={loading} className="w-full mt-2">
        {t('auth.common.sign-in')}
      </Button>

      {error ? (
        <Callout variant="error" role="alert">
          {error}
        </Callout>
      ) : null}
    </fetcher.Form>
  );
}
