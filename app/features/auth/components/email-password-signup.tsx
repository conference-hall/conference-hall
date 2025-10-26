import { Turnstile } from '@marsidev/react-turnstile';
import * as Firebase from 'firebase/auth';
import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, useNavigation, useSubmit } from 'react-router';
import { Button } from '~/design-system/buttons.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { PasswordInput } from '~/design-system/forms/password-input.tsx';
import { getFirebaseError } from '~/shared/auth/firebase.errors.ts';
import { getClientAuth } from '~/shared/auth/firebase.ts';
import { useNonce } from '~/shared/nonce/use-nonce.ts';
import type { SubmissionErrors } from '~/shared/types/errors.types.ts';
import { validateEmailAndPassword } from '~/shared/validators/auth.ts';

type EmailPasswordSignupProps = { redirectTo: string; defaultEmail: string | null; captchaSiteKey: string | null };

export function EmailPasswordSignup({ redirectTo, defaultEmail, captchaSiteKey }: EmailPasswordSignupProps) {
  const { t } = useTranslation();
  const [error, setError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<SubmissionErrors>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState(defaultEmail || '');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string>('');

  const submit = useSubmit();
  const navigation = useNavigation();
  const loading = navigation.state !== 'idle';
  const nonce = useNonce();

  const signUp = async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return;
    try {
      setError('');
      const fieldErrors = validateEmailAndPassword(email, password);
      if (fieldErrors) return setFieldErrors(fieldErrors);

      if (captchaSiteKey && !captchaToken) {
        setError(t('common.captcha-required'));
        return;
      }

      const clientAuth = getClientAuth();
      const credentials = await Firebase.createUserWithEmailAndPassword(clientAuth, email, password);
      await Firebase.updateProfile(credentials.user, { displayName: name });
      const token = await credentials.user.getIdToken(true);
      await submit({ token, captchaToken, redirectTo }, { method: 'POST', action: '/auth/login' });
    } catch (error) {
      setError(getFirebaseError(error, t));
    }
  };

  return (
    <Form className="space-y-4" onSubmit={signUp}>
      <Input
        label={t('common.full-name')}
        placeholder={t('common.full-name.placeholder')}
        name="name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        label={t('common.email')}
        placeholder={t('common.email.placeholder')}
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors?.email}
        required
      />
      <PasswordInput value={password} onChange={setPassword} error={fieldErrors?.password} isNewPassword />

      {captchaSiteKey && (
        <Turnstile
          siteKey={captchaSiteKey}
          onSuccess={setCaptchaToken}
          onError={() => setCaptchaToken('')}
          onExpire={() => setCaptchaToken('')}
          options={{ theme: 'light', size: 'invisible' }}
          scriptOptions={{ nonce }}
          className="hidden"
          aria-hidden
        />
      )}

      <Button type="submit" variant="primary" loading={loading} className="w-full mt-2">
        {t('auth.common.sign-up')}
      </Button>

      {error ? (
        <Callout variant="error" role="alert">
          {error}
        </Callout>
      ) : null}
    </Form>
  );
}
