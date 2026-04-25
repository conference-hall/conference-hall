import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import type { ParseKeys } from 'i18next';
import { useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { InputPassword } from '~/design-system/forms/input-password.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { authClient } from '~/shared/authentication/auth-client.ts';
import { getAuthError } from '~/shared/authentication/auth-errors.ts';
import { useNonce } from '~/shared/nonce/use-nonce.ts';
import type { I18nSubmissionErrors } from '~/shared/types/errors.types.ts';
import { validateEmailAndPassword } from '~/shared/validators/auth.ts';

type SignupFormProps = {
  defaultEmail: string;
  captchaSiteKey: string | undefined;
  onSuccess: () => void;
};

export function SignupForm({ defaultEmail, captchaSiteKey, onSuccess }: SignupFormProps) {
  const { t } = useTranslation();
  const nonce = useNonce();

  const [name, setName] = useState('');
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<ParseKeys | null>(null);
  const [fieldErrors, setFieldErrors] = useState<I18nSubmissionErrors>(null);
  const [loading, setLoading] = useState(false);

  const captchaRef = useRef<TurnstileInstance | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const signUp = async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return;

    const fieldErrors = validateEmailAndPassword(email, password);
    if (fieldErrors) return setFieldErrors(fieldErrors);

    let headers: Record<string, string> = {};
    if (captchaSiteKey) {
      if (!captchaToken) return setError(getAuthError({ code: 'INVALID_CAPTCHA' }));
      headers['x-captcha-response'] = captchaToken;
    }

    await authClient.signUp.email(
      { email, password, name },
      {
        headers,
        onRequest: () => setLoading(true),
        onSuccess,
        onError: (ctx) => {
          captchaRef.current?.reset();
          setError(getAuthError(ctx.error));
        },
      },
    );
    setLoading(false);
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
        error={fieldErrors?.email?.map((e) => t(e))}
        required
      />
      <InputPassword
        value={password}
        onChange={setPassword}
        isNewPassword
        error={fieldErrors?.password?.map((e) => t(e))}
      />

      {captchaSiteKey && (
        <Turnstile
          ref={captchaRef}
          siteKey={captchaSiteKey}
          onSuccess={setCaptchaToken}
          onError={() => setCaptchaToken(null)}
          onExpire={() => setCaptchaToken(null)}
          options={{ theme: 'light', size: 'invisible' }}
          scriptOptions={{ nonce }}
          className="hidden"
          aria-hidden
        />
      )}

      <Button type="submit" variant="primary" loading={loading} className="mt-2 w-full">
        {t('auth.common.sign-up')}
      </Button>

      {error ? (
        <Callout variant="error" role="alert">
          {t(error)}
        </Callout>
      ) : null}
    </Form>
  );
}
