import { Turnstile } from '@marsidev/react-turnstile';
import type { ParseKeys } from 'i18next';
import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { authClient, getAuthError } from '~/shared/better-auth/auth-client.ts';
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
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [error, setError] = useState<ParseKeys | null>(null);

  const resetPassword = async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return;

    await authClient.requestPasswordReset(
      { email, redirectTo: '/auth/reset-password' },
      {
        headers: captchaSiteKey ? { 'x-captcha-response': captchaToken } : undefined,
        onRequest: () => setLoading(true),
        onSuccess,
        onError: (ctx) => setError(getAuthError(ctx.error)),
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
