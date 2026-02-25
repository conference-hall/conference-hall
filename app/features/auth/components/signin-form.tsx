import { Turnstile } from '@marsidev/react-turnstile';
import type { ParseKeys } from 'i18next';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { InputPassword } from '~/design-system/forms/input-password.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { authClient, getAuthError } from '~/shared/better-auth/auth-client.ts';
import { useNonce } from '~/shared/nonce/use-nonce.ts';
import type { I18nSubmissionErrors } from '~/shared/types/errors.types.ts';
import { validateRequiredEmailAndPassword } from '~/shared/validators/auth.ts';

type SigninFormProps = {
  defaultEmail: string;
  captchaSiteKey: string | undefined;
  forgotPasswordPath: string;
  onSuccess: () => void;
  onEmailNotVerified: () => void;
};

export function SigninForm({
  defaultEmail,
  captchaSiteKey,
  forgotPasswordPath,
  onSuccess,
  onEmailNotVerified,
}: SigninFormProps) {
  const { t } = useTranslation();
  const nonce = useNonce();

  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<ParseKeys | null>(null);
  const [fieldErrors, setFieldErrors] = useState<I18nSubmissionErrors>(null);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>('');

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return;

    const fieldErrors = validateRequiredEmailAndPassword(email, password);
    if (fieldErrors) return setFieldErrors(fieldErrors);

    await authClient.signIn.email(
      { email, password },
      {
        headers: captchaSiteKey ? { 'x-captcha-response': captchaToken } : undefined,
        onRequest: () => setLoading(true),
        onSuccess,
        onError: async (ctx) => {
          setLoading(false);
          if (ctx.error.code === 'EMAIL_NOT_VERIFIED') {
            onEmailNotVerified();
          } else {
            setError(getAuthError(ctx.error));
          }
        },
      },
    );
  };

  return (
    <Form className="space-y-4" onSubmit={signIn}>
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
        forgotPasswordPath={forgotPasswordPath}
        error={fieldErrors?.password?.map((e) => t(e))}
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
        {t('auth.common.sign-in')}
      </Button>

      {error ? (
        <Callout variant="error" role="alert">
          {t(error)}
        </Callout>
      ) : null}
    </Form>
  );
}
