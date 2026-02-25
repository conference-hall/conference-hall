import type { ParseKeys } from 'i18next';
import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { InputPassword } from '~/design-system/forms/input-password.tsx';
import { authClient, getAuthError } from '~/shared/better-auth/auth-client.ts';
import type { I18nSubmissionErrors } from '~/shared/types/errors.types.ts';
import { validatePassword } from '~/shared/validators/auth.ts';

type ResetPasswordFormProps = {
  token: string | null;
  defaultError: ParseKeys | null;
  onSuccess: () => void;
};

export function ResetPasswordForm({ token, defaultError, onSuccess }: ResetPasswordFormProps) {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ParseKeys | null>(defaultError);
  const [fieldErrors, setFieldErrors] = useState<I18nSubmissionErrors>(null);
  const [password, setPassword] = useState('');

  const resetPassword = async (event: FormEvent) => {
    event.preventDefault();
    if (loading || !token) return;

    const fieldErrors = validatePassword(password);
    if (fieldErrors) return setFieldErrors(fieldErrors);

    await authClient.resetPassword(
      { newPassword: password, token },
      {
        onRequest: () => setLoading(true),
        onSuccess,
        onError: (ctx) => setError(getAuthError(ctx.error)),
      },
    );
    setLoading(false);
  };

  return (
    <Form className="space-y-4" onSubmit={resetPassword}>
      <InputPassword
        value={password}
        onChange={setPassword}
        isNewPassword
        error={fieldErrors?.password?.map((e) => t(e))}
        disabled={!token}
      />

      <Button type="submit" variant="primary" loading={loading} disabled={!token} className="mt-2 w-full">
        {t('auth.reset-password.submit')}
      </Button>

      {error ? (
        <Callout variant="error" role="alert">
          {t(error)}
        </Callout>
      ) : null}
    </Form>
  );
}
