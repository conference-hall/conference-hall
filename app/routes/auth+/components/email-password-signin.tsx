import * as Firebase from 'firebase/auth';
import { type FormEvent, useState } from 'react';
import { useFetcher } from 'react-router';
import { Button } from '~/design-system/buttons.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { LoadingIcon } from '~/design-system/icons/loading-icon.tsx';
import { getFirebaseError } from '~/libs/auth/firebase.errors.ts';
import { getClientAuth } from '~/libs/auth/firebase.ts';
import { PasswordInput } from './password-input.tsx';

type EmailPasswordSigninProps = { redirectTo: string; defaultEmail: string | null };

export function EmailPasswordSignin({ redirectTo, defaultEmail }: EmailPasswordSigninProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [email, setEmail] = useState(defaultEmail || '');
  const [password, setPassword] = useState('');

  const fetcher = useFetcher();

  const loading = submitting || fetcher.state !== 'idle';
  const forgotPasswordPath = email ? `/auth/forgot-password?email=${email}` : '/auth/forgot-password';

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return;
    try {
      setError('');
      setSubmitting(true);
      const credentials = await Firebase.signInWithEmailAndPassword(getClientAuth(), email, password);
      const token = await credentials.user.getIdToken();
      await fetcher.submit({ token, redirectTo }, { method: 'POST', action: '/auth/login' });
    } catch (error) {
      setError(getFirebaseError(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <fetcher.Form className="space-y-4" onSubmit={signIn}>
      <Input
        label="Email address"
        placeholder="example@site.com"
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <PasswordInput value={password} onChange={setPassword} forgotPasswordPath={forgotPasswordPath} />

      <Button type="submit" variant="primary" disabled={loading} className="w-full mt-2">
        {loading ? <LoadingIcon className="size-4" /> : 'Sign in'}
      </Button>

      {error ? <Callout variant="error">{error}</Callout> : null}
    </fetcher.Form>
  );
}
