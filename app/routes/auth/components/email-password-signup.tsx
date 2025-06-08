import * as Firebase from 'firebase/auth';
import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, useNavigation, useSubmit } from 'react-router';
import { Button } from '~/design-system/buttons.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { getFirebaseError } from '~/libs/auth/firebase.errors.ts';
import { getClientAuth } from '~/libs/auth/firebase.ts';
import { validateEmailAndPassword } from '~/libs/validators/auth.ts';
import type { SubmissionErrors } from '~/types/errors.types.ts';
import { PasswordInput } from './password-input.tsx';

type EmailPasswordSignupProps = { redirectTo: string; defaultEmail: string | null };

export function EmailPasswordSignup({ redirectTo, defaultEmail }: EmailPasswordSignupProps) {
  const { t } = useTranslation();
  const [error, setError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<SubmissionErrors>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState(defaultEmail || '');
  const [password, setPassword] = useState('');

  const submit = useSubmit();
  const navigation = useNavigation();
  const loading = navigation.state !== 'idle';

  const signUp = async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return;
    try {
      setError('');
      const fieldErrors = validateEmailAndPassword(email, password);
      if (fieldErrors) return setFieldErrors(fieldErrors);

      const clientAuth = getClientAuth();
      const credentials = await Firebase.createUserWithEmailAndPassword(clientAuth, email, password);
      await Firebase.updateProfile(credentials.user, { displayName: name });
      const token = await credentials.user.getIdToken(true);
      await submit({ token, redirectTo }, { method: 'POST', action: '/auth/login' });
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
