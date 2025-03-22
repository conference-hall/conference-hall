import * as Firebase from 'firebase/auth';
import { type FormEvent, useState } from 'react';
import { Form, useNavigation, useSubmit } from 'react-router';
import { Button } from '~/design-system/buttons.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { LoadingIcon } from '~/design-system/icons/loading-icon.tsx';
import { getFirebaseError } from '~/libs/auth/firebase.errors.ts';
import { getClientAuth } from '~/libs/auth/firebase.ts';
import { validateEmailAndPassword } from '~/libs/validators/auth.ts';
import type { SubmissionErrors } from '~/types/errors.types.ts';
import { PasswordInput } from './password-input.tsx';

type EmailPasswordSignupProps = { redirectTo: string; defaultEmail: string | null };

export function EmailPasswordSignup({ redirectTo, defaultEmail }: EmailPasswordSignupProps) {
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
      setError(getFirebaseError(error));
    }
  };

  return (
    <Form className="space-y-4" onSubmit={signUp}>
      <Input
        label="Full name"
        placeholder="John Doe"
        name="name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        label="Email address"
        placeholder="example@site.com"
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors?.email}
        required
      />
      <PasswordInput value={password} onChange={setPassword} error={fieldErrors?.password} isNewPassword />

      <Button type="submit" variant="primary" disabled={loading} className="w-full mt-2">
        {loading ? <LoadingIcon className="size-4" /> : 'Create your account'}
      </Button>

      {error ? (
        <Callout variant="error" role="alert">
          {error}
        </Callout>
      ) : null}
    </Form>
  );
}
