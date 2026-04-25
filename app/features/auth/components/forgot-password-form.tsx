import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import type { ParseKeys } from 'i18next';
import { type FormEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { authClient } from '~/shared/authentication/auth-client.ts';
import { getAuthError } from '~/shared/authentication/auth-errors.ts';
import { useNonce } from '~/shared/nonce/use-nonce.ts';

type ForgotPasswordFormProps = {
  defaultEmail: string;
  captchaSiteKey: string | undefined;
  onSuccess: () => void;
};

export function ForgotPasswordForm({ defaultEmail, captchaSiteKey, onSuccess }: ForgotPasswordFormProps) {
  const { t } = useTranslation();
  const nonce = useNonce();

  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ParseKeys | null>(null);

  const captchaRef = useRef<TurnstileInstance | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const resetPassword = async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return;

    let headers: Record<string, string> = {};
    if (captchaSiteKey) {
      if (!captchaToken) return setError(getAuthError({ code: 'INVALID_CAPTCHA' }));
      headers['x-captcha-response'] = captchaToken;
    }

    await authClient.requestPasswordReset(
      { email, redirectTo: '/auth/reset-password' },
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
    <Form method="POST" className="space-y-4" onSubmit={resetPassword}>
      <Input
        label={t('common.email')}
        placeholder={t('common.email.placeholder')}
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
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
        {t('auth.forgot-password.form.submit')}
      </Button>

      {error ? (
        <Callout variant="error" role="alert">
          {t(error)}
        </Callout>
      ) : null}
    </Form>
  );
}
